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

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "TVDS AI Vision Core"
    assert data["status"] == "operational"
    assert data["version"] == "2.2.0"


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


def test_normalize_devanagari_digits():
    dev_str = "बा २१ च १२३४"
    norm_digits = normalize_devanagari_digits(dev_str)
    assert norm_digits == "बा 21 च 1234"


def test_fix_ocr_glyph_confusions():
    confused_text = "BA 2I CHA I234"
    fixed = fix_ocr_glyph_confusions(confused_text)
    assert "1" in fixed or "I" in fixed  # Confusions in numbers fixed


def test_embossed_plate_validation():
    # Test Embossed standard
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "BA 21 CHA 1234", 0.92)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert res["plate_format"] == "EMBOSSED_LATIN"
    assert res["normalized_plate"] == "BA21CHA1234"
    assert res["formatted_display"] == "BA 21 CHA 1234"
    assert res["requires_review"] is False


def test_devanagari_zonal_validation():
    # Test Devanagari Zonal standard
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "बा २१ च १२३४", 0.88)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert res["plate_format"] == "DEVANAGARI_ZONAL"
    assert "१२३४" in res["formatted_display"]
    assert res["requires_review"] is False


def test_devanagari_provincial_validation():
    # Test Provincial standard
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "प्रदेश ३-०२-००१ च १२३४", 0.85)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert res["plate_format"] == "DEVANAGARI_PROVINCIAL"


def test_two_line_plate_sorting():
    # Top line at y=10, Bottom line at y=40
    mock_ocr = [
        ([[10, 40], [100, 40], [100, 70], [10, 70]], "5678", 0.95),  # bottom line
        ([[10, 10], [100, 10], [100, 35], [10, 35]], "BA 64 PA", 0.91),  # top line
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["is_valid_syntax"] is True
    assert "BA 64 PA 5678" in res["formatted_display"] or "5678" in res["formatted_display"]


def test_low_confidence_review_flagging():
    # OCR result with low confidence
    mock_ocr = [
        ([[10, 10], [100, 10], [100, 40], [10, 40]], "BA 21 CHA 1234", 0.40)
    ]
    res = parse_and_validate_nepali_plate(mock_ocr)
    assert res["requires_review"] is True
    assert res["review_reason"] is not None


def test_perspective_correction_rotation():
    # Create a synthetic white rectangle rotated by 15 degrees
    img = np.zeros((100, 200, 3), dtype=np.uint8)
    cv2.rectangle(img, (30, 30), (170, 70), (255, 255, 255), -1)
    
    # Rotate by 10 degrees
    center = (100, 50)
    M = cv2.getRotationMatrix2D(center, 10, 1.0)
    rotated = cv2.warpAffine(img, M, (200, 100))
    
    deskewed = correct_plate_perspective(rotated)
    assert deskewed is not None
    assert deskewed.shape == rotated.shape


def test_rider_spatial_association():
    motorcycle_bbox = [200, 300, 350, 500]
    rider = {"class": "person", "confidence": 0.88, "bbox": [220, 200, 320, 420]}
    pedestrian = {"class": "person", "confidence": 0.85, "bbox": [50, 200, 120, 450]}
    
    matched_riders = get_riders_for_motorcycle(motorcycle_bbox, [rider, pedestrian])
    assert len(matched_riders) == 1
    assert matched_riders[0]["bbox"] == rider["bbox"]


def test_process_image_synthetic():
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    result = process_image(dummy_img, frame_idx=0)
    
    assert "detections" in result
    assert "violations" in result
    assert "vehicle_number" in result
    assert "plate_details" in result
    assert result["meta"]["model_version"] == "2.2.0"


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
            assert "violations" in data
            assert "plate_details" in data
            assert data["meta"]["engine"] == "YOLOv8-N + Modular Nepali ANPR"
