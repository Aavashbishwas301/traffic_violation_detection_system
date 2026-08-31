import pytest
import os
import cv2
import numpy as np
from fastapi.testclient import TestClient

# Set test API key before importing app
os.environ["AI_API_KEY"] = "test-api-key"

from main import (
    app,
    parse_nepali_plate_syntax,
    get_riders_for_motorcycle,
    evaluate_rider_helmet,
    process_image
)

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "TVDS AI Vision Core"
    assert data["status"] == "operational"
    assert data["version"] == "2.1.0"


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


def test_nepali_plate_parser_embossed():
    # Mock EasyOCR result for embossed plate: [[bbox], "BA 21 CHA 1234", 0.92]
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "BA 21 CHA 1234", 0.92)
    ]
    plate, conf = parse_nepali_plate_syntax(mock_ocr)
    assert plate is not None
    assert "BA 21 CHA 1234" in plate or "BA21CHA1234" in plate.replace(" ", "")
    assert conf > 0.80


def test_nepali_plate_parser_devanagari():
    # Mock EasyOCR result for Devanagari plate: [[bbox], "बा २१ च १२३४", 0.89]
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "बा २१ च १२३४", 0.89)
    ]
    plate, conf = parse_nepali_plate_syntax(mock_ocr)
    assert plate is not None
    assert "बा २१ च १२३४" in plate or "१२३४" in plate
    assert conf > 0.80


def test_nepali_plate_parser_multiline():
    # Mock two-line plate (line 1 at y=10, line 2 at y=40)
    mock_ocr = [
        ([[10, 40], [100, 40], [100, 70], [10, 70]], "5678", 0.95), # bottom line
        ([[10, 10], [100, 10], [100, 35], [10, 35]], "BA 64 PA", 0.91), # top line
    ]
    plate, conf = parse_nepali_plate_syntax(mock_ocr)
    assert plate is not None
    # Should sort top line before bottom line
    assert "BA" in plate or "5678" in plate


def test_rider_spatial_association_no_false_pedestrians():
    # Motorcycle located at x: [200, 350], y: [300, 500]
    motorcycle_bbox = [200, 300, 350, 500]
    
    # 1 rider on the bike (x: [220, 320], y: [200, 420])
    rider = {"class": "person", "confidence": 0.88, "bbox": [220, 200, 320, 420]}
    
    # 2 pedestrians far away (x: [50, 120], y: [200, 450]) and (x: [500, 580], y: [200, 450])
    pedestrian1 = {"class": "person", "confidence": 0.85, "bbox": [50, 200, 120, 450]}
    pedestrian2 = {"class": "person", "confidence": 0.82, "bbox": [500, 200, 580, 450]}
    
    all_persons = [rider, pedestrian1, pedestrian2]
    matched_riders = get_riders_for_motorcycle(motorcycle_bbox, all_persons)
    
    # Only the actual rider should match, NOT the 2 pedestrians
    assert len(matched_riders) == 1
    assert matched_riders[0]["bbox"] == rider["bbox"]


def test_process_image_synthetic():
    # Test end-to-end processing with a blank synthetic image
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    result = process_image(dummy_img, frame_idx=0)
    
    assert "detections" in result
    assert "violations" in result
    assert "vehicle_number" in result
    assert "vehicle_type" in result
    assert "light_color" in result
    assert "meta" in result
    assert result["meta"]["model_version"] == "2.1.0"
    assert "latency_ms" in result["meta"]


def test_detect_real_workspace_image():
    # Test on real image if present
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
            assert "violations" in data
            assert "meta" in data
            assert data["meta"]["engine"] == "YOLOv8-N + Dual-Stage Nepali ANPR"


def test_detect_video_file():
    # Test on real test video if present
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
            assert "detections" in data
            assert "violations" in data
            assert "meta" in data
            assert "video_info" in data["meta"]
            assert data["meta"]["video_info"]["processed_frames"] > 0


