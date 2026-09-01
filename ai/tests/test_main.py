import pytest
import os
import cv2
import numpy as np
from fastapi.testclient import TestClient

# Set test API key before importing app
os.environ["AI_API_KEY"] = "test-api-key"

from main import (
    app,
    correct_plate_perspective,
    preprocess_plate_image,
    get_riders_for_motorcycle,
    evaluate_rider_helmet,
    process_image
)
from nepali_plate_parser import (
    normalize_devanagari_digits,
    clean_plate_characters,
    fix_ocr_glyph_confusions,
    parse_and_validate_nepali_plate,
    NepalPlateValidator
)
from tracker import VehicleTrackerManager, VehicleTrack

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "TVDS AI Vision Core"
    assert data["status"] == "operational"
    assert data["version"] == "2.5.0"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_detect_unauthorized():
    response = client.post("/detect")
    assert response.status_code == 401


def test_detect_no_file():
    response = client.post("/detect", headers={"Authorization": "Bearer test-api-key"})
    assert response.status_code == 422


# --- TRACKING TESTS (PHASE 2) ---

def test_single_vehicle_tracking_persistence():
    manager = VehicleTrackerManager(max_lost_frames=30)
    
    # Simulate single vehicle moving across 10 frames
    track_id = 101
    for frame_idx in range(10):
        bbox = [100 + frame_idx * 5, 200 + frame_idx * 2, 250 + frame_idx * 5, 350 + frame_idx * 2]
        track = manager.update_track(
            track_id=track_id,
            bbox=bbox,
            vehicle_type="Car",
            frame_idx=frame_idx
        )
        assert track.track_id == 101
        assert track.last_seen_frame == frame_idx
    
    assert len(track.trajectory) == 10
    dx, dy = track.get_motion_vector()
    assert dx > 0  # Moving rightward


def test_multiple_vehicles_unique_tracking_ids():
    manager = VehicleTrackerManager(max_lost_frames=30)
    
    # Vehicle 1 (Car)
    t1 = manager.update_track(track_id=1, bbox=[100, 100, 200, 200], vehicle_type="Car", frame_idx=0)
    # Vehicle 2 (Bike)
    t2 = manager.update_track(track_id=2, bbox=[300, 100, 360, 220], vehicle_type="Bike", frame_idx=0)
    # Vehicle 3 (Bus)
    t3 = manager.update_track(track_id=3, bbox=[400, 50, 550, 300], vehicle_type="Bus", frame_idx=0)
    
    summary = manager.get_summary()
    assert summary["active_tracks"] == 3
    assert t1.track_id != t2.track_id != t3.track_id


def test_occlusion_and_temporary_loss_recovery():
    manager = VehicleTrackerManager(max_lost_frames=30)
    
    # Vehicle appears in frames 0..5
    for f in range(6):
        manager.update_track(track_id=42, bbox=[150, 150, 250, 250], vehicle_type="Car", frame_idx=f)
        
    # Occlusion for 10 frames (frames 6..15 not detected)
    manager.cleanup_lost_tracks(current_frame_idx=15)
    assert 42 in manager.tracks  # Should still be retained in buffer
    
    # Re-emerges in frame 16
    t_recovered = manager.update_track(track_id=42, bbox=[180, 180, 280, 280], vehicle_type="Car", frame_idx=16)
    assert t_recovered.track_id == 42
    assert t_recovered.last_seen_frame == 16


def test_vehicle_entry_and_exit_lifecycle():
    manager = VehicleTrackerManager(max_lost_frames=10)
    
    # Vehicle enters at frame 0 and leaves at frame 5
    for f in range(6):
        manager.update_track(track_id=99, bbox=[10, 10, 80, 80], vehicle_type="Bike", frame_idx=f)
        
    # Frame 20 (15 frames after last seen -> exceeds max_lost_frames 10)
    manager.cleanup_lost_tracks(current_frame_idx=20)
    assert 99 not in manager.tracks  # Successfully retired from active memory


def test_duplicate_event_suppression_single_citation():
    manager = VehicleTrackerManager(max_lost_frames=30)
    track_id = 7
    
    # Simulate a car passing through a Red Light continuously over 30 video frames
    violation_records_emitted = []
    for f in range(30):
        bbox = [100, 50 + f * 2, 220, 180 + f * 2]
        # Register violation each frame
        v = manager.register_violation_event(
            track_id=track_id,
            violation_type="Traffic Light",
            confidence=0.88,
            bbox=bbox,
            frame_idx=f,
            vehicle_number="BA 21 CHA 1234",
            vehicle_type="Car"
        )
        if v is not None:
            violation_records_emitted.append(v)
            
    # CRITICAL TEST: 30 consecutive violation frames must produce EXACTLY 1 violation citation
    assert len(violation_records_emitted) == 1
    assert len(manager.all_recorded_violations) == 1
    
    record = manager.all_recorded_violations[0]
    assert record["track_id"] == 7
    assert record["first_frame"] == 0
    assert record["last_frame"] == 29
    assert record["frames_visible"] == 30


# --- ANPR & VISION TESTS ---

def test_normalize_devanagari_digits():
    dev_str = "बा २१ च १२३४"
    norm_digits = normalize_devanagari_digits(dev_str)
    assert norm_digits == "बा 21 च 1234"


def test_embossed_plate_validation():
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "BA 21 CHA 1234", 0.92)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert res["plate_format"] == "EMBOSSED_LATIN"
    assert res["normalized_plate"] == "BA21CHA1234"


def test_devanagari_zonal_validation():
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "बा २१ च १२३४", 0.88)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert res["plate_format"] == "DEVANAGARI_ZONAL"


def test_two_line_plate_sorting():
    mock_ocr = [
        ([[10, 40], [100, 40], [100, 70], [10, 70]], "5678", 0.95),
        ([[10, 10], [100, 10], [100, 35], [10, 35]], "BA 64 PA", 0.91),
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True


def test_perspective_correction_rotation():
    img = np.zeros((100, 200, 3), dtype=np.uint8)
    cv2.rectangle(img, (30, 30), (170, 70), (255, 255, 255), -1)
    center = (100, 50)
    M = cv2.getRotationMatrix2D(center, 10, 1.0)
    rotated = cv2.warpAffine(img, M, (200, 100))
    deskewed = correct_plate_perspective(rotated)
    assert deskewed is not None


def test_process_image_synthetic():
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    result = process_image(dummy_img, frame_idx=0)
    assert "detections" in result
    assert "violations" in result
    assert result["meta"]["model_version"] == "2.5.0"


def test_detect_real_workspace_image():
    img_path = os.path.join(os.path.dirname(__file__), "..", "..", "perfect_ai_test.png")
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            response = client.post(
                "/detect",
                files={"file": ("perfect_ai_test.png", f, "image/png")},
                headers={"Authorization": "Bearer test-api-key"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "detections" in data


def test_detect_video_file_bytetrack():
    vid_path = os.path.join(os.path.dirname(__file__), "..", "..", "traffic_violation_vids", "Two Cars Go Straight Through a Red Traffic Light _Driving _DashCam _UkDashCam _Cars _UkRoads _Shorts.mp4")
    if os.path.exists(vid_path):
        with open(vid_path, "rb") as f:
            response = client.post(
                "/detect",
                files={"file": ("test_traffic.mp4", f, "video/mp4")},
                headers={"Authorization": "Bearer test-api-key"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "tracking_summary" in data
            assert "video_info" in data["meta"]
            assert data["meta"]["video_info"]["processed_frames"] > 0
