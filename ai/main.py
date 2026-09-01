from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ultralytics import YOLO
import cv2
import numpy as np
import io
import os
import json
import tempfile
from PIL import Image
import easyocr
import re
import gc
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from nepali_plate_parser import parse_and_validate_nepali_plate
from tracker import VehicleTrackerManager, VehicleTrack
from zones import ZoneEvaluator
from rtsp_stream import global_rtsp_manager, RTSPStreamManager

app = FastAPI(title="TVDS AI Vision Core", version="2.5.0")
security = HTTPBearer(auto_error=False)

# Configurable Environment Constants
AI_API_KEY = os.getenv("AI_API_KEY", "tvds-ai-key-dev")
YOLO_CONFIDENCE_THRESHOLD = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.30"))
AI_CONFIDENCE_THRESHOLD_VERIFIED = float(os.getenv("AI_CONFIDENCE_THRESHOLD_VERIFIED", "0.75"))
AI_CONFIDENCE_THRESHOLD_REVIEW = float(os.getenv("AI_CONFIDENCE_THRESHOLD_REVIEW", "0.50"))

# Global Model Cache
model = YOLO('yolov8n.pt')
# Initialize EasyOCR for English and Nepali
reader = easyocr.Reader(['en', 'ne'], gpu=False)

# Camera Stream Trackers Cache
camera_trackers: Dict[str, VehicleTrackerManager] = {}

# Vehicle Class & DoTM Category Mappings
VEHICLE_CLASS_MAPPING = {
    'car': 'Car',
    'motorcycle': 'Bike',
    'bus': 'Bus',
    'truck': 'Truck'
}
TRAFFIC_CLASSES = ['person', 'bicycle', 'traffic light', 'car', 'motorcycle', 'bus', 'truck']


async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing API key")
    if credentials.credentials != AI_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials


def correct_plate_perspective(plate_img):
    """
    Detects skew angle of license plate and applies rotation/affine transform to align text horizontally.
    """
    if plate_img is None or plate_img.size == 0:
        return plate_img

    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY) if len(plate_img.shape) == 3 else plate_img
    edges = cv2.Canny(gray, 50, 200, apertureSize=3)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return plate_img

    largest_cnt = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest_cnt) < (plate_img.shape[0] * plate_img.shape[1] * 0.10):
        return plate_img

    rect = cv2.minAreaRect(largest_cnt)
    angle = rect[-1]

    # Normalize rotation angle
    if angle < -45:
        angle = 90 + angle
    elif angle > 45:
        angle = angle - 90

    # Rotate only if significant skew detected (-35 to +35 deg)
    if abs(angle) > 1.5 and abs(angle) < 35:
        (h, w) = plate_img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(plate_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated

    return plate_img


def preprocess_plate_image(plate_img):
    """
    Enhances contrast, applies CLAHE and adaptive thresholding for clear OCR text.
    """
    if plate_img is None or plate_img.size == 0:
        return None

    # Step 1: Bilinear upscaling for low resolution plate crops (min width: 300px)
    h, w = plate_img.shape[:2]
    if w < 300 or h < 90:
        scale = max(300 / max(w, 1), 90 / max(h, 1))
        new_w, new_h = int(w * scale), int(h * scale)
        plate_img = cv2.resize(plate_img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

    # Step 2: Perspective deskewing
    deskewed = correct_plate_perspective(plate_img)

    # Step 3: Grayscale conversion
    gray = cv2.cvtColor(deskewed, cv2.COLOR_BGR2GRAY) if len(deskewed.shape) == 3 else deskewed

    # Step 4: CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Step 5: Bilateral filter to smooth noise while preserving sharp character edges
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
    return denoised


def extract_plate_number(img, vehicle_bbox):
    """
    Target ANPR Pipeline:
    Vehicle BBox -> Candidate Plate Localization -> Perspective Correction -> Enhancement -> EasyOCR -> Nepali Parser
    """
    x1, y1, x2, y2 = [int(x) for x in vehicle_bbox]
    h, w, _ = img.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    vehicle_crop = img[y1:y2, x1:x2]
    if vehicle_crop.size == 0:
        return {
            "raw_ocr": "",
            "normalized_plate": "Unknown",
            "formatted_display": "Unknown",
            "plate_format": "UNKNOWN",
            "confidence": 0.0,
            "is_valid_syntax": False,
            "plate_bbox": None,
            "requires_review": True,
            "review_reason": "Empty vehicle crop"
        }

    vh, vw = vehicle_crop.shape[:2]

    # Target lower 60% of vehicle where license plate is positioned
    lower_offset_y = int(vh * 0.40)
    lower_crop = vehicle_crop[lower_offset_y:vh, 0:vw]
    target_crop = lower_crop if lower_crop.size > 0 else vehicle_crop

    plate_global_y1 = int(y1 + (lower_offset_y if lower_crop.size > 0 else 0))
    plate_global_y2 = int(y2)
    plate_global_x1 = int(x1)
    plate_global_x2 = int(x2)
    plate_bbox = [plate_global_x1, plate_global_y1, plate_global_x2, plate_global_y2]

    processed_crop = preprocess_plate_image(target_crop)
    if processed_crop is None:
        return {
            "raw_ocr": "",
            "normalized_plate": "Unknown",
            "formatted_display": "Unknown",
            "plate_format": "UNKNOWN",
            "confidence": 0.0,
            "is_valid_syntax": False,
            "plate_bbox": plate_bbox,
            "requires_review": True,
            "review_reason": "Plate preprocessing failed"
        }

    try:
        results = reader.readtext(processed_crop)
        parsed = parse_and_validate_nepali_plate(results)

        if parsed["normalized_plate"] == "Unknown" and lower_crop.size > 0:
            full_processed = preprocess_plate_image(vehicle_crop)
            results_full = reader.readtext(full_processed)
            parsed = parse_and_validate_nepali_plate(results_full)

        parsed["plate_bbox"] = plate_bbox
        return parsed
    except Exception as e:
        return {
            "raw_ocr": "",
            "normalized_plate": "Unknown",
            "formatted_display": "Unknown",
            "plate_format": "UNKNOWN",
            "confidence": 0.0,
            "is_valid_syntax": False,
            "plate_bbox": plate_bbox,
            "requires_review": True,
            "review_reason": f"OCR Exception: {str(e)}"
        }


def detect_light_color(img, bbox):
    """
    Crops traffic light and determines active color using HSV color segmentation.
    """
    x1, y1, x2, y2 = [int(x) for x in bbox]
    light_crop = img[y1:y2, x1:x2]

    if light_crop.size == 0:
        return "Unknown"

    hsv = cv2.cvtColor(light_crop, cv2.COLOR_BGR2HSV)

    lower_red1 = np.array([0, 70, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([170, 70, 50])
    upper_red2 = np.array([180, 255, 255])

    lower_yellow = np.array([20, 100, 100])
    upper_yellow = np.array([35, 255, 255])

    lower_green = np.array([40, 70, 70])
    upper_green = np.array([85, 255, 255])

    mask_red = cv2.inRange(hsv, lower_red1, upper_red1) + cv2.inRange(hsv, lower_red2, upper_red2)
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    colors = {
        "Red": cv2.countNonZero(mask_red),
        "Yellow": cv2.countNonZero(mask_yellow),
        "Green": cv2.countNonZero(mask_green)
    }

    best_color = max(colors, key=colors.get)
    return best_color if colors[best_color] > 15 else "Unknown"


def evaluate_rider_helmet(img, rider_bbox):
    """
    Evaluates helmet compliance on a motorcycle rider.
    Analyzes the head region (top 35% of rider bbox) for headgear visual characteristics.
    """
    x1, y1, x2, y2 = [int(x) for x in rider_bbox]
    h, w, _ = img.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    head_h = int((y2 - y1) * 0.35)
    head_crop = img[y1:y1 + head_h, x1:x2]

    if head_crop.size == 0 or head_crop.shape[0] < 10 or head_crop.shape[1] < 10:
        return True, 0.50

    gray = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])

    hsv_head = cv2.cvtColor(head_crop, cv2.COLOR_BGR2HSV)
    brightness_std = np.std(hsv_head[:, :, 2])

    if edge_density > 0.30 and brightness_std > 50:
        return False, 0.78
    elif edge_density < 0.20:
        return True, 0.82

    return True, 0.65


def get_riders_for_motorcycle(motorcycle_bbox, persons):
    """
    Associates detected persons with a specific motorcycle using spatial containment.
    """
    mx1, my1, mx2, my2 = motorcycle_bbox
    riders = []

    for p in persons:
        px1, py1, px2, py2 = p['bbox']
        pw = px2 - px1

        overlap_x1 = max(mx1 - 25, px1)
        overlap_x2 = min(mx2 + 25, px2)
        overlap_w = max(0, overlap_x2 - overlap_x1)

        is_above_or_on_bike = (py2 >= my1 - 20) and (py1 <= my2)

        if overlap_w > (pw * 0.40) and is_above_or_on_bike:
            riders.append(p)

    return riders


def process_image(
    img,
    frame_idx: int = 0,
    tracker_manager: Optional[VehicleTrackerManager] = None,
    track_results: Optional[Any] = None,
    camera_zones: Optional[List[Dict[str, Any]]] = None
):
    """
    Runs full inference on an image frame:
    - Object Detection & ByteTrack association
    - Spatial rider & helmet analysis
    - Modular Nepali ANPR with perspective deskewing and format validation
    - Dynamic resolution-independent geometric Camera Zones evaluation
    - Violation classification with duplicate-event suppression via VehicleTrackerManager
    """
    start_time = cv2.getTickCount()
    timestamp_str = datetime.now(timezone.utc).isoformat()
    img_h, img_w = img.shape[:2]

    # 1. Run YOLO Object Detection / Tracking
    if track_results is not None:
        results = track_results
    else:
        results = model(img, conf=YOLO_CONFIDENCE_THRESHOLD, verbose=False)

    detections = []
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            name = model.names[cls]
            if name in TRAFFIC_CLASSES:
                # Extract ByteTrack tracking ID if present
                track_id = int(box.id[0]) if (box.id is not None and len(box.id) > 0) else None
                detections.append({
                    "class": name,
                    "confidence": round(float(box.conf[0]), 4),
                    "bbox": [round(x, 2) for x in box.xyxy[0].tolist()],
                    "track_id": track_id,
                    "frame_number": frame_idx
                })

    violations = []

    # 2. Extract Primary Vehicle & License Plate (ANPR)
    detected_vehicle_number = "Unknown"
    detected_vehicle_type = "Other"
    plate_info = {
        "raw_ocr": "",
        "normalized_plate": "Unknown",
        "formatted_display": "Unknown",
        "plate_format": "UNKNOWN",
        "confidence": 0.0,
        "is_valid_syntax": False,
        "plate_bbox": None,
        "requires_review": True,
        "review_reason": "No vehicle detected"
    }

    vehicles = [d for d in detections if d['class'] in VEHICLE_CLASS_MAPPING]
    for v in vehicles:
        v_type = VEHICLE_CLASS_MAPPING.get(v['class'], 'Other')
        v['vehicle_type'] = v_type
        # Update tracker manager if tracking is active
        if tracker_manager is not None:
            tracker_manager.update_track(
                track_id=v.get("track_id"),
                bbox=v['bbox'],
                vehicle_type=v_type,
                frame_idx=frame_idx
            )

    if vehicles:
        vehicles.sort(key=lambda x: (x['bbox'][2] - x['bbox'][0]) * (x['bbox'][3] - x['bbox'][1]), reverse=True)
        primary_vehicle = vehicles[0]
        detected_vehicle_type = VEHICLE_CLASS_MAPPING.get(primary_vehicle['class'], 'Other')
        prim_track_id = primary_vehicle.get("track_id")

        # ANPR Performance Optimization: Skip OCR if tracked vehicle already has confirmed plate >= 0.70
        cached_plate = tracker_manager.get_confirmed_plate(prim_track_id) if tracker_manager is not None else None
        if cached_plate:
            detected_vehicle_number = cached_plate["plate_number"]
            plate_info = {
                "raw_ocr": cached_plate["plate_number"],
                "normalized_plate": cached_plate["plate_number"],
                "formatted_display": cached_plate["plate_number"],
                "plate_format": "CACHED_TRACK",
                "confidence": cached_plate["confidence"],
                "is_valid_syntax": True,
                "plate_bbox": primary_vehicle['bbox'],
                "requires_review": False,
                "review_reason": None
            }
        else:
            plate_info = extract_plate_number(img, primary_vehicle['bbox'])
            if plate_info["formatted_display"] != "Unknown":
                detected_vehicle_number = plate_info["formatted_display"]

                if tracker_manager is not None and prim_track_id is not None:
                    tracker_manager.update_track(
                        track_id=prim_track_id,
                        bbox=primary_vehicle["bbox"],
                        vehicle_type=detected_vehicle_type,
                        frame_idx=frame_idx,
                        plate_number=detected_vehicle_number,
                        plate_confidence=plate_info["confidence"]
                    )

    persons = [d for d in detections if d['class'] == 'person']
    motorcycles = [d for d in detections if d['class'] == 'motorcycle']

    # 3. Spatial Motorcycle Rider & Helmet Analysis
    for motor in motorcycles:
        riders = get_riders_for_motorcycle(motor['bbox'], persons)
        motor_track_id = motor.get("track_id") or 1

        # Triple Riding Check
        if len(riders) >= 3:
            rider_conf = sum(r['confidence'] for r in riders) / len(riders)
            v_conf = round(float(min(1.0, rider_conf * 0.95)), 4)
            is_req_review = bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED)
            review_msg = "Review rider count" if is_req_review else None

            if tracker_manager is not None:
                v_record = tracker_manager.register_violation_event(
                    track_id=motor_track_id,
                    violation_type="Triple Riding",
                    confidence=v_conf,
                    bbox=motor['bbox'],
                    frame_idx=frame_idx,
                    timestamp_str=timestamp_str,
                    requires_review=is_req_review,
                    review_reason=review_msg,
                    vehicle_number=detected_vehicle_number,
                    vehicle_type="Bike"
                )
                if v_record is not None:
                    violations.append(v_record)
            else:
                violations.append({
                    "type": "Triple Riding",
                    "track_id": motor_track_id,
                    "confidence": v_conf,
                    "requiresReview": is_req_review,
                    "reviewReason": review_msg,
                    "bbox": motor['bbox'],
                    "vehicle_number": detected_vehicle_number,
                    "vehicle_type": "Bike",
                    "frame_number": frame_idx,
                    "timestamp": timestamp_str
                })

        # No Helmet Check
        for rider in riders:
            has_helmet, helmet_conf = evaluate_rider_helmet(img, rider['bbox'])
            if not has_helmet:
                total_conf = round(float(rider['confidence'] * helmet_conf), 4)
                if total_conf >= AI_CONFIDENCE_THRESHOLD_REVIEW:
                    is_req_review = bool(total_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED)
                    review_msg = "Low helmet confidence" if is_req_review else None

                    if tracker_manager is not None:
                        v_record = tracker_manager.register_violation_event(
                            track_id=motor_track_id,
                            violation_type="No Helmet",
                            confidence=total_conf,
                            bbox=rider['bbox'],
                            frame_idx=frame_idx,
                            timestamp_str=timestamp_str,
                            requires_review=is_req_review,
                            review_reason=review_msg,
                            vehicle_number=detected_vehicle_number,
                            vehicle_type="Bike"
                        )
                        if v_record is not None:
                            violations.append(v_record)
                    else:
                        violations.append({
                            "type": "No Helmet",
                            "track_id": motor_track_id,
                            "confidence": total_conf,
                            "requiresReview": is_req_review,
                            "reviewReason": review_msg,
                            "bbox": rider['bbox'],
                            "vehicle_number": detected_vehicle_number,
                            "vehicle_type": "Bike",
                            "frame_number": frame_idx,
                            "timestamp": timestamp_str
                        })
                    break

    # 4. Traffic Signal & Camera Zone Evaluation
    traffic_lights = [d for d in detections if d['class'] == 'traffic light']
    current_light_color = "Unknown"

    if traffic_lights:
        traffic_lights.sort(key=lambda x: x['confidence'], reverse=True)
        current_light_color = detect_light_color(img, traffic_lights[0]['bbox'])

    # Dynamic Geometric Zone Evaluation
    if camera_zones and len(camera_zones) > 0:
        zone_violations = ZoneEvaluator.evaluate_zones(
            vehicles=vehicles,
            zones=camera_zones,
            light_color=current_light_color,
            img_w=img_w,
            img_h=img_h
        )

        for zv in zone_violations:
            zv_track_id = zv.get("track_id") or 1
            if tracker_manager is not None:
                v_record = tracker_manager.register_violation_event(
                    track_id=zv_track_id,
                    violation_type=zv["type"],
                    confidence=zv["confidence"],
                    bbox=zv["bbox"],
                    frame_idx=frame_idx,
                    timestamp_str=timestamp_str,
                    requires_review=zv["requiresReview"],
                    review_reason=f"Zone: {zv.get('zone_name')}",
                    vehicle_number=detected_vehicle_number,
                    vehicle_type=zv["vehicle_type"]
                )
                if v_record is not None:
                    violations.append(v_record)
            else:
                violations.append({
                    "type": zv["type"],
                    "zone_name": zv.get("zone_name"),
                    "track_id": zv_track_id,
                    "confidence": zv["confidence"],
                    "requiresReview": zv["requiresReview"],
                    "reviewReason": f"Zone: {zv.get('zone_name')}",
                    "bbox": zv["bbox"],
                    "vehicle_number": detected_vehicle_number,
                    "vehicle_type": zv["vehicle_type"],
                    "frame_number": frame_idx,
                    "timestamp": timestamp_str
                })
    else:
        # Backward-compatible fallback proportional zones if no geometric zones provided
        if current_light_color == "Red":
            for v in vehicles:
                v_track_id = v.get("track_id") or 1
                v_type = VEHICLE_CLASS_MAPPING.get(v['class'], 'Other')

                if v['bbox'][1] < img_h * 0.40:
                    v_conf = round(float(v['confidence'] * 0.85), 4)
                    is_req_review = bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED)

                    if tracker_manager is not None:
                        v_record = tracker_manager.register_violation_event(
                            track_id=v_track_id,
                            violation_type="Traffic Light",
                            confidence=v_conf,
                            bbox=v['bbox'],
                            frame_idx=frame_idx,
                            timestamp_str=timestamp_str,
                            requires_review=is_req_review,
                            review_reason="Proportional Stop Line",
                            vehicle_number=detected_vehicle_number,
                            vehicle_type=v_type
                        )
                        if v_record is not None:
                            violations.append(v_record)
                    else:
                        violations.append({
                            "type": "Traffic Light",
                            "track_id": v_track_id,
                            "confidence": v_conf,
                            "requiresReview": is_req_review,
                            "reviewReason": "Proportional Stop Line",
                            "bbox": v['bbox'],
                            "vehicle_number": detected_vehicle_number,
                            "vehicle_type": v_type,
                            "frame_number": frame_idx,
                            "timestamp": timestamp_str
                        })

                if v['bbox'][3] > img_h * 0.72:
                    v_conf = round(float(v['confidence'] * 0.80), 4)
                    is_req_review = bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED)

                    if tracker_manager is not None:
                        v_record = tracker_manager.register_violation_event(
                            track_id=v_track_id,
                            violation_type="Zebra Crossing",
                            confidence=v_conf,
                            bbox=v['bbox'],
                            frame_idx=frame_idx,
                            timestamp_str=timestamp_str,
                            requires_review=is_req_review,
                            review_reason="Proportional Crosswalk",
                            vehicle_number=detected_vehicle_number,
                            vehicle_type=v_type
                        )
                        if v_record is not None:
                            violations.append(v_record)
                    else:
                        violations.append({
                            "type": "Zebra Crossing",
                            "track_id": v_track_id,
                            "confidence": v_conf,
                            "requiresReview": is_req_review,
                            "reviewReason": "Proportional Crosswalk",
                            "bbox": v['bbox'],
                            "vehicle_number": detected_vehicle_number,
                            "vehicle_type": v_type,
                            "frame_number": frame_idx,
                            "timestamp": timestamp_str
                        })

    end_time = cv2.getTickCount()
    latency = (end_time - start_time) / cv2.getTickFrequency() * 1000

    if detections:
        avg_conf = sum(d['confidence'] for d in detections) / len(detections)
        accuracy_score = round(avg_conf * 100, 1)
    else:
        accuracy_score = 0.0

    return {
        "detections": detections,
        "violations": violations,
        "vehicle_number": detected_vehicle_number,
        "vehicle_type": detected_vehicle_type,
        "light_color": current_light_color,
        "plate_details": plate_info,
        "meta": {
            "engine": "YOLOv8-N + ByteTrack + Dynamic Zones + Modular Nepali ANPR",
            "latency_ms": round(latency, 2),
            "model_version": "2.5.0",
            "threads": 8,
            "accuracy_score": accuracy_score,
            "detection_count": len(detections),
            "timestamp": timestamp_str
        }
    }


def rtsp_frame_processor(frame, camera_id: str, zones: List[Dict[str, Any]], frame_idx: int):
    """
    Unified stream frame processor for background RTSP threads.
    Feeds frame through ByteTrack, ZoneEvaluator, and emits deduplicated citations.
    """
    if camera_id not in camera_trackers:
        camera_trackers[camera_id] = VehicleTrackerManager(max_lost_frames=30)
    tracker = camera_trackers[camera_id]

    track_results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        conf=YOLO_CONFIDENCE_THRESHOLD,
        verbose=False
    )

    result = process_image(
        frame,
        frame_idx=frame_idx,
        tracker_manager=tracker,
        track_results=track_results,
        camera_zones=zones
    )
    # Cleanup retired tracks
    tracker.cleanup_lost_tracks(frame_idx)
    return result


@app.get("/")
def read_root():
    return {"status": "operational", "service": "TVDS AI Vision Core", "version": "2.5.0"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "engine": "YOLOv8-N + ByteTrack + Dynamic Zones + Live RTSP Ingestion",
        "version": "2.5.0",
        "active_rtsp_streams": len(global_rtsp_manager.workers)
    }


# --- RTSP STREAM MANAGEMENT ENDPOINTS ---

@app.get("/rtsp/cameras")
def get_all_rtsp_cameras(auth: HTTPAuthorizationCredentials = Depends(verify_api_key)):
    """Returns real-time health telemetry across all active CCTV streams."""
    return {
        "success": True,
        "cameras": global_rtsp_manager.get_all_statuses()
    }


@app.get("/rtsp/cameras/{camera_id}")
def get_rtsp_camera_status(camera_id: str, auth: HTTPAuthorizationCredentials = Depends(verify_api_key)):
    """Returns telemetry for a specific camera stream."""
    status = global_rtsp_manager.get_camera_status(camera_id)
    if not status:
        return {"success": False, "status": "OFFLINE", "camera_id": camera_id}
    return {"success": True, "camera": status}


@app.post("/rtsp/cameras/start")
def start_rtsp_stream(
    payload: Dict[str, Any] = Body(...),
    auth: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Starts live RTSP stream worker thread."""
    camera_id = payload.get("camera_id")
    rtsp_url = payload.get("rtsp_url")
    zones = payload.get("zones", [])
    sample_rate_fps = float(payload.get("sample_rate_fps", 2.0))

    if not camera_id or not rtsp_url:
        raise HTTPException(status_code=400, detail="camera_id and rtsp_url are required")

    status = global_rtsp_manager.start_camera_stream(
        camera_id=camera_id,
        rtsp_url=rtsp_url,
        zones=zones,
        sample_rate_fps=sample_rate_fps,
        process_callback=rtsp_frame_processor
    )
    return {"success": True, "message": f"RTSP stream started for {camera_id}", "camera": status}


@app.post("/rtsp/cameras/stop")
def stop_rtsp_stream(
    payload: Dict[str, Any] = Body(...),
    auth: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Stops an active RTSP stream."""
    camera_id = payload.get("camera_id")
    if not camera_id:
        raise HTTPException(status_code=400, detail="camera_id is required")

    stopped = global_rtsp_manager.stop_camera_stream(camera_id)
    return {"success": True, "stopped": stopped, "camera_id": camera_id}


# --- EXISTING UPLOAD & BATCH ENDPOINT ---

@app.post("/detect")
async def detect_violations(
    file: UploadFile = File(...),
    zones: Optional[str] = Form(None),
    auth: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    parsed_zones = None
    if zones:
        try:
            parsed_zones = json.loads(zones)
        except Exception:
            parsed_zones = None

    contents = await file.read()
    filename = file.filename.lower() if file.filename else ""
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    is_video = any(filename.endswith(ext) for ext in video_extensions)

    if is_video:
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                temp_path = tmp.name
                tmp.write(contents)

            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open video file")

            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            sample_interval = max(1, int(fps))

            # Initialize ByteTrack Manager for this video stream
            tracker_manager = VehicleTrackerManager(max_lost_frames=30)

            all_results = []
            frame_count = 0
            processed_count = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count % sample_interval == 0:
                    # Run YOLO with ByteTrack tracking enabled across sequential video frames
                    track_results = model.track(
                        frame,
                        persist=True,
                        tracker="bytetrack.yaml",
                        conf=YOLO_CONFIDENCE_THRESHOLD,
                        verbose=False
                    )

                    result = process_image(
                        frame,
                        frame_idx=frame_count,
                        tracker_manager=tracker_manager,
                        track_results=track_results,
                        camera_zones=parsed_zones
                    )
                    all_results.append(result)
                    processed_count += 1

                    # Cleanup retired tracks periodically
                    tracker_manager.cleanup_lost_tracks(frame_count)

                frame_count += 1

            cap.release()

            # Aggregate final results using tracker manager deduplicated events
            aggregated_detections = []
            total_accuracy = 0
            best_vehicle_number = "Unknown"
            best_vehicle_type = "Other"
            best_plate_details = None

            for result in all_results:
                if result['vehicle_number'] != "Unknown" and best_vehicle_number == "Unknown":
                    best_vehicle_number = result['vehicle_number']
                    best_vehicle_type = result['vehicle_type']
                    best_plate_details = result.get('plate_details')

                aggregated_detections.extend(result['detections'])
                total_accuracy += result['meta']['accuracy_score']

            avg_accuracy = round(total_accuracy / len(all_results), 1) if all_results else 0.0
            tracking_summary = tracker_manager.get_summary()

            return {
                "detections": aggregated_detections,
                "violations": tracker_manager.all_recorded_violations,
                "vehicle_number": best_vehicle_number,
                "vehicle_type": best_vehicle_type,
                "plate_details": best_plate_details,
                "light_color": all_results[-1]['light_color'] if all_results else "Unknown",
                "tracking_summary": tracking_summary,
                "meta": {
                    "engine": "YOLOv8-N + ByteTrack + Dynamic Zones + Live RTSP Ingestion",
                    "latency_ms": round(sum(r['meta']['latency_ms'] for r in all_results) / len(all_results), 2) if all_results else 0,
                    "model_version": "2.5.0",
                    "threads": 8,
                    "accuracy_score": avg_accuracy,
                    "detection_count": len(aggregated_detections),
                    "video_info": {
                        "total_frames": total_frames,
                        "processed_frames": processed_count,
                        "fps": round(fps, 2)
                    }
                }
            }
        finally:
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
            gc.collect()
    else:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image file")

        return process_image(img, frame_idx=0, camera_zones=parsed_zones)


@app.on_event("shutdown")
def shutdown_event():
    """Stops all background RTSP stream worker threads cleanly."""
    global_rtsp_manager.stop_all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)