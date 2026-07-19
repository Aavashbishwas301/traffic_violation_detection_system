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

app = FastAPI()
security = HTTPBearer(auto_error=False)

# Global Model Cache
model = YOLO('yolov8n.pt') 
reader = easyocr.Reader(['en'], gpu=False) # Set gpu=True if you have a CUDA GPU

# API Key Authentication
AI_API_KEY = os.getenv("AI_API_KEY", "tvds-ai-key-dev")

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing API key")
    if credentials.credentials != AI_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials

def extract_plate_number(img, bbox):
    """
    Crops the vehicle from the image and tries to extract the license plate number.
    """
    x1, y1, x2, y2 = [int(x) for x in bbox]
    # Add a small buffer and ensure within image bounds
    h, w, _ = img.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    
    vehicle_crop = img[y1:y2, x1:x2]
    
    if vehicle_crop.size == 0:
        return None

    # Run OCR on the crop
    results = reader.readtext(vehicle_crop)
    
    # Heuristic: Filter for something that looks like a plate (alphanumeric, 4-10 chars)
    # This is a simple regex for many license plate formats
    plate_pattern = re.compile(r'[A-Z0-9\-\s]{4,12}')
    
    best_plate = None
    max_conf = 0
    
    for (bbox_ocr, text, prob) in results:
        clean_text = text.upper().strip()
        if plate_pattern.match(clean_text) and prob > max_conf:
            # Basic cleanup: remove spaces and special chars
            best_plate = re.sub(r'[^A-Z0-9]', '', clean_text)
            max_conf = prob
            
    return best_plate

@app.get("/")
def read_root():
    return {"status": "operational", "service": "TVDS AI Vision Core"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

def detect_light_color(img, bbox):
    """
    Crops the traffic light and determines if it is Red, Green, or Yellow.
    """
    x1, y1, x2, y2 = [int(x) for x in bbox]
    light_crop = img[y1:y2, x1:x2]
    
    if light_crop.size == 0:
        return "Unknown"

    # Convert to HSV for better color detection
    hsv = cv2.cvtColor(light_crop, cv2.COLOR_BGR2HSV)
    
    # Define color ranges (approximate)
    # Red has two ranges in HSV
    lower_red1 = np.array([0, 70, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([170, 70, 50])
    upper_red2 = np.array([180, 255, 255])
    
    lower_yellow = np.array([20, 100, 100])
    upper_yellow = np.array([30, 255, 255])
    
    lower_green = np.array([40, 70, 70])
    upper_green = np.array([80, 255, 255])

    mask_red = cv2.inRange(hsv, lower_red1, upper_red1) + cv2.inRange(hsv, lower_red2, upper_red2)
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    colors = {
        "Red": cv2.countNonZero(mask_red),
        "Yellow": cv2.countNonZero(mask_yellow),
        "Green": cv2.countNonZero(mask_green)
    }
    
    best_color = max(colors, key=colors.get)
    if colors[best_color] > 10: # Threshold to avoid noise
        return best_color
    return "Unknown"

def check_helmet(img, rider_bbox):
    """
    Heuristic: Crops the top part of the rider (head) and checks for skin-like colors.
    If high percentage of skin color is found, it likely means no helmet.
    """
    x1, y1, x2, y2 = [int(x) for x in rider_bbox]
    # Head is roughly the top 20% of the person's bounding box
    head_height = int((y2 - y1) * 0.22)
    head_crop = img[y1:y1+head_height, x1:x2]
    
    if head_crop.size == 0:
        return True 

    # Convert to HSV for skin color detection
    hsv = cv2.cvtColor(head_crop, cv2.COLOR_BGR2HSV)
    
    # Define skin color ranges (approximate for various lighting)
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    skin_pixels = cv2.countNonZero(mask)
    total_pixels = head_crop.shape[0] * head_crop.shape[1]
    
    if total_pixels == 0: return True
    
    skin_ratio = skin_pixels / total_pixels
    
    # If more than 15% of the head is "skin" colored, it's likely a bare head/no helmet
    return skin_ratio < 0.15

def process_image(img):
    """Run detection on a single image frame and return results."""
    start_time = cv2.getTickCount()
    
    results = model(img, conf=0.25, verbose=False)
    
    detections = []
    VEHICLE_CLASSES = ['car', 'motorcycle', 'bus', 'truck']
    TRAFFIC_CLASSES = ['person', 'bicycle', 'traffic light'] + VEHICLE_CLASSES
    
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            name = model.names[cls]
            if name in TRAFFIC_CLASSES:
                detections.append({
                    "class": name,
                    "confidence": round(float(box.conf[0]), 4),
                    "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                })

    violations = []
    
    # 1. OCR and Vehicle Type
    detected_vehicle_number = "Unknown"
    detected_vehicle_type = "Other"
    vehicles = [d for d in detections if d['class'] in VEHICLE_CLASSES]
    
    if vehicles:
        vehicles.sort(key=lambda x: (x['bbox'][2]-x['bbox'][0])*(x['bbox'][3]-x['bbox'][1]), reverse=True)
        primary_vehicle = vehicles[0]
        
        type_mapping = {'car': 'Car', 'bus': 'Bus', 'truck': 'Truck', 'motorcycle': 'Bike'}
        detected_vehicle_type = type_mapping.get(primary_vehicle['class'], 'Other')
        
        plate = extract_plate_number(img, primary_vehicle['bbox'])
        if plate:
            detected_vehicle_number = plate

    # 2. Triple Riding Logic
    persons = [d for d in detections if d['class'] == 'person']
    motorcycles = [d for d in detections if d['class'] == 'motorcycle']
    
    if len(persons) >= 3 and len(motorcycles) >= 1:
        violations.append({"type": "Triple Riding", "confidence": 0.85})
    
    # 3. No Helmet Logic
    for motor in motorcycles:
        # Find people near/on this motorcycle (within horizontal bounds)
        riders = [p for p in persons if p['bbox'][0] >= motor['bbox'][0] - 20 and p['bbox'][2] <= motor['bbox'][2] + 20]
        for rider in riders:
            if not check_helmet(img, rider['bbox']):
                violations.append({"type": "No Helmet", "confidence": 0.78})
                break 

    # 4. Traffic Light & Zebra Crossing Logic
    traffic_lights = [d for d in detections if d['class'] == 'traffic light']
    current_light_color = "Unknown"
    if traffic_lights:
        traffic_lights.sort(key=lambda x: x['confidence'], reverse=True)
        current_light_color = detect_light_color(img, traffic_lights[0]['bbox'])
        
        if current_light_color == "Red":
            for v in vehicles:
                # Red Light Jump (passing the light zone)
                if v['bbox'][1] < img.shape[0] * 0.4:
                    violations.append({"type": "Traffic Light", "confidence": 0.72})
                
                # Zebra Crossing (stopped/passing over the crossing area - usually bottom 30%)
                if v['bbox'][3] > img.shape[0] * 0.7:
                    violations.append({"type": "Zebra Crossing", "confidence": 0.81})
    
    # 5. Wrong Way & Sidewalk Encroachment Heuristics
    for v in vehicles:
        # Wrong Way: If a large vehicle is in the extreme left lane (assuming right-hand traffic flow)
        if v['class'] in ['bus', 'truck'] and v['bbox'][0] < img.shape[1] * 0.1:
            violations.append({"type": "Wrong Way", "confidence": 0.65})
        
        # Sidewalk Encroachment: If any vehicle is in the extreme right 12% of the frame (the sidewalk zone)
        if v['bbox'][2] > img.shape[1] * 0.88:
            violations.append({"type": "Sidewalk Encroachment", "confidence": 0.76})
    
    end_time = cv2.getTickCount()
    latency = (end_time - start_time) / cv2.getTickFrequency() * 1000

    # Calculate real accuracy score from detection confidences
    if detections:
        avg_confidence = sum(d['confidence'] for d in detections) / len(detections)
        accuracy_score = round(avg_confidence * 100, 1)
    else:
        accuracy_score = 0.0

    return {
        "detections": detections,
        "violations": violations,
        "vehicle_number": detected_vehicle_number,
        "vehicle_type": detected_vehicle_type,
        "light_color": current_light_color,
        "meta": {
            "engine": "YOLOv8-N + EasyOCR", 
            "latency_ms": round(latency, 2),
            "model_version": "2.0.1",
            "threads": 8,
            "accuracy_score": accuracy_score,
            "detection_count": len(detections)
        }
    }

@app.post("/detect")
async def detect_violations(
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    # Read file bytes
    contents = await file.read()
    
    # Check if it's a video file by extension
    filename = file.filename.lower() if file.filename else ""
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    is_video = any(filename.endswith(ext) for ext in video_extensions)
    
    if is_video:
        # Video processing: extract frames and run detection on each
        temp_path = None
        try:
            # Write to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                tmp.write(contents)
                temp_path = tmp.name
            
            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open video file")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Sample frames at 1 FPS (or every frame if video is short)
            sample_interval = max(1, int(fps))
            
            all_results = []
            frame_count = 0
            processed_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % sample_interval == 0:
                    result = process_image(frame)
                    all_results.append(result)
                    processed_count += 1
                
                frame_count += 1
            
            cap.release()
            
            # Aggregate results across all frames
            aggregated_violations = {}
            aggregated_detections = []
            total_accuracy = 0
            
            for result in all_results:
                for v in result['violations']:
                    key = v['type']
                    if key not in aggregated_violations:
                        aggregated_violations[key] = {"type": key, "confidence": v['confidence'], "frames": 0}
                    aggregated_violations[key]["frames"] += 1
                    aggregated_violations[key]["confidence"] = max(aggregated_violations[key]["confidence"], v['confidence'])
                
                aggregated_detections.extend(result['detections'])
                total_accuracy += result['meta']['accuracy_score']
            
            avg_accuracy = round(total_accuracy / len(all_results), 1) if all_results else 0
            
            return {
                "detections": aggregated_detections,
                "violations": list(aggregated_violations.values()),
                "vehicle_number": all_results[-1]['vehicle_number'] if all_results else "Unknown",
                "vehicle_type": all_results[-1]['vehicle_type'] if all_results else "Other",
                "light_color": all_results[-1]['light_color'] if all_results else "Unknown",
                "meta": {
                    "engine": "YOLOv8-N + EasyOCR",
                    "latency_ms": round(sum(r['meta']['latency_ms'] for r in all_results) / len(all_results), 2) if all_results else 0,
                    "model_version": "2.0.1",
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
        # Image processing (original behavior)
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image file")
        
        return process_image(img)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)