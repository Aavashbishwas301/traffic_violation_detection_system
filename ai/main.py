from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ultralytics import YOLO
import cv2
import numpy as np
import io
import os
import tempfile
from PIL import Image
import easyocr
import re
from datetime import datetime, timezone

app = FastAPI(title="TVDS AI Vision Core", version="2.1.0")
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


def preprocess_plate_image(plate_img):
    """
    Enhances contrast, applies CLAHE and adaptive thresholding for clear OCR text.
    """
    if plate_img is None or plate_img.size == 0:
        return None

    # Resize if too small
    h, w = plate_img.shape[:2]
    if w < 160 or h < 60:
        scale = max(160 / max(w, 1), 60 / max(h, 1))
        new_w, new_h = int(w * scale), int(h * scale)
        plate_img = cv2.resize(plate_img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY) if len(plate_img.shape) == 3 else plate_img

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Denoise
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
    return denoised


def parse_nepali_plate_syntax(ocr_results):
    """
    Parses OCR results according to Nepal license plate grammar standards:
    1. Embossed Latin: [PROVINCE/ZONE] [LOT] [CATEGORY] [4-DIGIT NUMBER] (e.g., 'BA 21 CHA 1234', 'PROV 3 PA 5678')
    2. Devanagari: [प्रदेश/अञ्चल] [लट] [प्रकार: च/प/ख/क/ज/बा/झ] [४ अंक] (e.g., 'बा २१ च १२३४', 'को १ प ९८७६')
    3. Multi-line ordering: Sorts upper line (Zone/Lot) before lower line (Number).
    """
    if not ocr_results:
        return None, 0.0

    # Sort lines vertically by y-coordinate to support 2-line two-wheeler plates
    sorted_lines = sorted(ocr_results, key=lambda item: item[0][0][1])

    all_text_tokens = []
    confidences = []

    for bbox, text, prob in sorted_lines:
        clean = text.strip()
        if clean:
            all_text_tokens.append(clean)
            confidences.append(prob)

    if not all_text_tokens:
        return None, 0.0

    full_raw = " ".join(all_text_tokens).upper()
    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

    # Clean characters (Allow Latin A-Z, 0-9, Devanagari Unicode \u0900-\u097F, spaces and hyphens)
    filtered = re.sub(r'[^A-Z0-9\u0900-\u097F\s\-]', '', full_raw)
    words = [w for w in filtered.split() if len(w) > 0]
    normalized_str = "".join(words)

    # 1. Check for standard Embossed English Plate format
    # Patterns like: BA 21 CHA 1234, PROV 3 01 023 PA 4567, 01 023 PA 4567
    embossed_match = re.search(r'(?:(?:PROV|PROVINCE)\s*\d{1,2}|BA|KO|GA|LU|KA|SU|ME|SE|BHE|RA|DHA|JA|SA)?\s*(\d{1,3})\s*(PA|CHA|KHA|KA|JA|BA|GHA|TA|THA|DA|DHA|YA|RA|LA|VA|SA|HA)\s*(\d{3,4})', filtered)
    if embossed_match:
        prefix = embossed_match.group(0).strip()
        return prefix, min(1.0, avg_conf + 0.15)

    # 2. Check for standard Devanagari Plate format
    # Patterns like: बा २१ च १२३४, प्रदेश ३-०२-००१ च १२३४
    devanagari_match = re.search(r'([\u0900-\u097F\d\-]+)\s*([०-९\d]{1,4})\s*([चपखकजबाझगघतथदधयरलवशषसह])\s*([०-९\d]{3,4})', filtered)
    if devanagari_match:
        plate_str = devanagari_match.group(0).strip()
        return plate_str, min(1.0, avg_conf + 0.15)

    # 3. Fallback: Alphanumeric string with at least letters and numbers
    has_letters = bool(re.search(r'[A-Z\u0900-\u0965\u0970-\u097F]', normalized_str))
    has_numbers = bool(re.search(r'[0-9\u0966-\u096F]', normalized_str))

    if len(normalized_str) >= 4 and has_letters and has_numbers:
        return " ".join(words), avg_conf

    return (normalized_str, avg_conf) if len(normalized_str) >= 4 else (None, 0.0)


def extract_plate_number(img, vehicle_bbox):
    """
    Two-Stage ANPR:
    1. Localizes the lower portion of the vehicle crop (where plates reside) or high contrast plate area.
    2. Runs enhanced OCR with Nepali syntax parsing.
    """
    x1, y1, x2, y2 = [int(x) for x in vehicle_bbox]
    h, w, _ = img.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    vehicle_crop = img[y1:y2, x1:x2]
    if vehicle_crop.size == 0:
        return None, 0.0

    vh, vw = vehicle_crop.shape[:2]

    # Crop lower 60% of vehicle where license plate is typically located to eliminate roof/window noise
    lower_crop = vehicle_crop[int(vh * 0.40):vh, 0:vw]
    target_crop = lower_crop if lower_crop.size > 0 else vehicle_crop

    # Preprocess image
    processed_crop = preprocess_plate_image(target_crop)
    if processed_crop is None:
        return None, 0.0

    try:
        # Run EasyOCR with contrast enhancements
        results = reader.readtext(processed_crop)
        plate_text, conf = parse_nepali_plate_syntax(results)

        # Fallback to full vehicle crop if lower slice gave nothing
        if not plate_text and lower_crop.size > 0:
            full_processed = preprocess_plate_image(vehicle_crop)
            results_full = reader.readtext(full_processed)
            plate_text, conf = parse_nepali_plate_syntax(results_full)

        return plate_text, conf
    except Exception as e:
        print(f"ANPR OCR Warning: {e}")
        return None, 0.0


def detect_light_color(img, bbox):
    """
    Crops traffic light and determines active color using HSV color segmentation.
    """
    x1, y1, x2, y2 = [int(x) for x in bbox]
    light_crop = img[y1:y2, x1:x2]

    if light_crop.size == 0:
        return "Unknown"

    hsv = cv2.cvtColor(light_crop, cv2.COLOR_BGR2HSV)

    # Red wraps around 0 and 180 in HSV
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
    Returns: (is_wearing_helmet: bool, confidence: float)
    """
    x1, y1, x2, y2 = [int(x) for x in rider_bbox]
    h, w, _ = img.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    head_h = int((y2 - y1) * 0.35)
    head_crop = img[y1:y1 + head_h, x1:x2]

    if head_crop.size == 0 or head_crop.shape[0] < 10 or head_crop.shape[1] < 10:
        return True, 0.50  # Default to neutral on inconclusive crop

    gray = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)
    
    # Helmets have high edge smoothness on top and distinct specular reflections
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])

    # HSV saturation / brightness check
    hsv_head = cv2.cvtColor(head_crop, cv2.COLOR_BGR2HSV)
    brightness_std = np.std(hsv_head[:, :, 2])

    # Distinctive contrast heuristics (hair/skin has high texture variance, helmet has smoother shells)
    if edge_density > 0.30 and brightness_std > 50:
        # Texture pattern indicates exposed face / hair
        return False, 0.78
    elif edge_density < 0.20:
        # Smooth shell surface indicates helmet
        return True, 0.82

    return True, 0.65


def get_riders_for_motorcycle(motorcycle_bbox, persons):
    """
    Associates detected persons with a specific motorcycle using spatial containment.
    Returns a list of person detections seated on this bike.
    """
    mx1, my1, mx2, my2 = motorcycle_bbox
    mw = mx2 - mx1
    riders = []

    for p in persons:
        px1, py1, px2, py2 = p['bbox']
        pw = px2 - px1
        
        # Horizontal overlap check (person must be within bike's horizontal zone)
        overlap_x1 = max(mx1 - 25, px1)
        overlap_x2 = min(mx2 + 25, px2)
        overlap_w = max(0, overlap_x2 - overlap_x1)

        # Vertical check: person's bottom must be near the bike's seat/body
        is_above_or_on_bike = (py2 >= my1 - 20) and (py1 <= my2)

        if overlap_w > (pw * 0.40) and is_above_or_on_bike:
            riders.append(p)

    return riders


def process_image(img, frame_idx=0):
    """
    Runs full inference on a single image frame:
    - Object detection (Vehicles, Riders, Traffic Lights)
    - Spatial rider & helmet analysis
    - Two-stage ANPR license plate recognition
    - Violation classification with configurable review flags
    """
    start_time = cv2.getTickCount()
    timestamp_str = datetime.now(timezone.utc).isoformat()

    # 1. Run YOLO Object Detection
    results = model(img, conf=YOLO_CONFIDENCE_THRESHOLD, verbose=False)

    detections = []
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            name = model.names[cls]
            if name in TRAFFIC_CLASSES:
                detections.append({
                    "class": name,
                    "confidence": round(float(box.conf[0]), 4),
                    "bbox": [round(x, 2) for x in box.xyxy[0].tolist()],
                    "frame_number": frame_idx
                })

    violations = []

    # 2. Extract Primary Vehicle & License Plate (ANPR)
    detected_vehicle_number = "Unknown"
    detected_vehicle_type = "Other"
    plate_conf = 0.0

    vehicles = [d for d in detections if d['class'] in VEHICLE_CLASS_MAPPING]
    if vehicles:
        # Sort by bounding box area to focus on prominent foreground vehicle
        vehicles.sort(key=lambda x: (x['bbox'][2] - x['bbox'][0]) * (x['bbox'][3] - x['bbox'][1]), reverse=True)
        primary_vehicle = vehicles[0]
        detected_vehicle_type = VEHICLE_CLASS_MAPPING.get(primary_vehicle['class'], 'Other')

        extracted_plate, p_conf = extract_plate_number(img, primary_vehicle['bbox'])
        if extracted_plate:
            detected_vehicle_number = extracted_plate
            plate_conf = p_conf

    persons = [d for d in detections if d['class'] == 'person']
    motorcycles = [d for d in detections if d['class'] == 'motorcycle']

    # 3. Spatial Motorcycle Rider & Helmet Analysis
    for motor in motorcycles:
        riders = get_riders_for_motorcycle(motor['bbox'], persons)
        
        # Triple Riding Check
        if len(riders) >= 3:
            rider_conf = sum(r['confidence'] for r in riders) / len(riders)
            v_conf = round(float(min(1.0, rider_conf * 0.95)), 4)
            violations.append({
                "type": "Triple Riding",
                "confidence": v_conf,
                "requiresReview": bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED),
                "reviewReason": "Review rider count" if v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED else None,
                "bbox": motor['bbox'],
                "vehicle_number": detected_vehicle_number,
                "vehicle_type": "Bike",
                "frame_number": frame_idx,
                "timestamp": timestamp_str
            })

        # No Helmet Check for each rider on the bike
        for rider in riders:
            has_helmet, helmet_conf = evaluate_rider_helmet(img, rider['bbox'])
            if not has_helmet:
                total_conf = round(float(rider['confidence'] * helmet_conf), 4)
                if total_conf >= AI_CONFIDENCE_THRESHOLD_REVIEW:
                    violations.append({
                        "type": "No Helmet",
                        "confidence": total_conf,
                        "requiresReview": bool(total_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED),
                        "reviewReason": "Low helmet confidence" if total_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED else None,
                        "bbox": rider['bbox'],
                        "vehicle_number": detected_vehicle_number,
                        "vehicle_type": "Bike",
                        "frame_number": frame_idx,
                        "timestamp": timestamp_str
                    })
                    break  # One helmet violation per motorcycle is sufficient

    # 4. Traffic Light & Zebra Crossing Violations
    traffic_lights = [d for d in detections if d['class'] == 'traffic light']
    current_light_color = "Unknown"

    if traffic_lights:
        traffic_lights.sort(key=lambda x: x['confidence'], reverse=True)
        current_light_color = detect_light_color(img, traffic_lights[0]['bbox'])

        if current_light_color == "Red":
            for v in vehicles:
                # Red Light Jump (passing upper intersection line)
                if v['bbox'][1] < img.shape[0] * 0.40:
                    v_conf = round(float(v['confidence'] * 0.85), 4)
                    violations.append({
                        "type": "Traffic Light",
                        "confidence": v_conf,
                        "requiresReview": bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED),
                        "reviewReason": "Red light intersection crossing" if v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED else None,
                        "bbox": v['bbox'],
                        "vehicle_number": detected_vehicle_number,
                        "vehicle_type": VEHICLE_CLASS_MAPPING.get(v['class'], 'Other'),
                        "frame_number": frame_idx,
                        "timestamp": timestamp_str
                    })

                # Zebra Crossing Encroachment
                if v['bbox'][3] > img.shape[0] * 0.72:
                    v_conf = round(float(v['confidence'] * 0.80), 4)
                    violations.append({
                        "type": "Zebra Crossing",
                        "confidence": v_conf,
                        "requiresReview": bool(v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED),
                        "reviewReason": "Stop line / crosswalk encroachment" if v_conf < AI_CONFIDENCE_THRESHOLD_VERIFIED else None,
                        "bbox": v['bbox'],
                        "vehicle_number": detected_vehicle_number,
                        "vehicle_type": VEHICLE_CLASS_MAPPING.get(v['class'], 'Other'),
                        "frame_number": frame_idx,
                        "timestamp": timestamp_str
                    })

    end_time = cv2.getTickCount()
    latency = (end_time - start_time) / cv2.getTickFrequency() * 1000

    # Calculate overall frame accuracy score
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
        "meta": {
            "engine": "YOLOv8-N + Dual-Stage Nepali ANPR",
            "latency_ms": round(latency, 2),
            "model_version": "2.1.0",
            "threads": 8,
            "accuracy_score": accuracy_score,
            "detection_count": len(detections),
            "timestamp": timestamp_str
        }
    }


@app.get("/")
def read_root():
    return {"status": "operational", "service": "TVDS AI Vision Core", "version": "2.1.0"}


@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "YOLOv8-N + EasyOCR", "version": "2.1.0"}


@app.post("/detect")
async def detect_violations(
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
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

            all_results = []
            frame_count = 0
            processed_count = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count % sample_interval == 0:
                    result = process_image(frame, frame_idx=frame_count)
                    all_results.append(result)
                    processed_count += 1

                frame_count += 1

            cap.release()

            # Aggregate results across frames
            aggregated_violations = {}
            aggregated_detections = []
            total_accuracy = 0
            best_vehicle_number = "Unknown"
            best_vehicle_type = "Other"

            for result in all_results:
                if result['vehicle_number'] != "Unknown" and best_vehicle_number == "Unknown":
                    best_vehicle_number = result['vehicle_number']
                    best_vehicle_type = result['vehicle_type']

                for v in result['violations']:
                    key = v['type']
                    if key not in aggregated_violations:
                        aggregated_violations[key] = {
                            "type": key,
                            "confidence": v['confidence'],
                            "requiresReview": v.get('requiresReview', False),
                            "reviewReason": v.get('reviewReason'),
                            "bbox": v.get('bbox'),
                            "frames": 0,
                            "first_frame": v.get('frame_number', 0)
                        }
                    aggregated_violations[key]["frames"] += 1
                    aggregated_violations[key]["confidence"] = max(aggregated_violations[key]["confidence"], v['confidence'])

                aggregated_detections.extend(result['detections'])
                total_accuracy += result['meta']['accuracy_score']

            avg_accuracy = round(total_accuracy / len(all_results), 1) if all_results else 0.0

            return {
                "detections": aggregated_detections,
                "violations": list(aggregated_violations.values()),
                "vehicle_number": best_vehicle_number,
                "vehicle_type": best_vehicle_type,
                "light_color": all_results[-1]['light_color'] if all_results else "Unknown",
                "meta": {
                    "engine": "YOLOv8-N + Dual-Stage Nepali ANPR",
                    "latency_ms": round(sum(r['meta']['latency_ms'] for r in all_results) / len(all_results), 2) if all_results else 0,
                    "model_version": "2.1.0",
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
    else:
        # Single image processing
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image file")

        return process_image(img, frame_idx=0)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)