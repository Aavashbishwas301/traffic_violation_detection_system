import pytest
import os
import time
import cv2
import numpy as np
from fastapi.testclient import TestClient

os.environ["AI_API_KEY"] = "test-api-key"

from main import app, global_rtsp_manager
from rtsp_stream import RTSPStreamWorker, RTSPStreamManager

client = TestClient(app)


def test_rtsp_stream_worker_lifecycle():
    """Verifies that an RTSPStreamWorker initializes, runs, and stops cleanly."""
    vid_path = os.path.join(os.path.dirname(__file__), "..", "..", "traffic_violation_vids", "Two Cars Go Straight Through a Red Traffic Light _Driving _DashCam _UkDashCam _Cars _UkRoads _Shorts.mp4")
    
    # Use real local video file as local stream test
    target_source = vid_path if os.path.exists(vid_path) else "rtsp://mock.invalid/stream"
    
    processed_count = [0]
    def dummy_callback(frame, cam_id, zones, frame_idx):
        processed_count[0] += 1

    worker = RTSPStreamWorker(
        camera_id="TEST_CAM_01",
        rtsp_url=target_source,
        zones=[],
        sample_rate_fps=4.0,
        process_callback=dummy_callback
    )

    worker.start()
    time.sleep(0.8) # Allow thread to spin up and read frames

    status = worker.get_status()
    assert status["camera_id"] == "TEST_CAM_01"
    assert status["status"] in ["ONLINE", "CONNECTING", "RECONNECTING"]

    worker.stop()
    assert worker.status in ["STOPPED", "OFFLINE"]


def test_rtsp_auto_reconnect_on_disconnection():
    """Verifies that an invalid RTSP URL enters RECONNECTING state gracefully with backoff."""
    worker = RTSPStreamWorker(
        camera_id="TEST_DISCONNECTED_CAM",
        rtsp_url="rtsp://invalid.nonexistent.local:554/live",
        zones=[],
        sample_rate_fps=2.0
    )

    worker.start()
    time.sleep(0.5)

    status = worker.get_status()
    assert status["camera_id"] == "TEST_DISCONNECTED_CAM"
    assert status["status"] in ["RECONNECTING", "CONNECTING", "ERROR"]
    assert status["last_error"] is not None

    worker.stop()


def test_multi_camera_thread_isolation():
    """
    CRITICAL REQUIREMENT: One failing / dropped camera must NOT crash other cameras or the service.
    """
    manager = RTSPStreamManager()

    # Camera 1 (Faulty connection)
    manager.start_camera_stream(
        camera_id="CAM_FAULTY",
        rtsp_url="rtsp://192.0.2.1:554/dead_stream",
        sample_rate_fps=2.0
    )

    # Camera 2 (Valid local stream or another worker)
    manager.start_camera_stream(
        camera_id="CAM_HEALTHY",
        rtsp_url="rtsp://192.0.2.2:554/healthy_stream",
        sample_rate_fps=2.0
    )

    time.sleep(0.5)
    all_statuses = manager.get_all_statuses()
    assert len(all_statuses) == 2

    # Verify faulty camera is isolated in its own thread and didn't crash manager
    cam_ids = [s["camera_id"] for s in all_statuses]
    assert "CAM_FAULTY" in cam_ids
    assert "CAM_HEALTHY" in cam_ids

    manager.stop_all()


def test_rtsp_endpoints_fastapi():
    """Tests FastAPI RTSP management and health telemetry endpoints."""
    # 1. Start Camera Stream Endpoint
    start_res = client.post(
        "/rtsp/cameras/start",
        json={
            "camera_id": "CAM_API_TEST",
            "rtsp_url": "rtsp://127.0.0.1:8554/live",
            "sample_rate_fps": 2.0,
            "zones": []
        },
        headers={"Authorization": "Bearer test-api-key"}
    )
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["success"] is True
    assert start_data["camera"]["camera_id"] == "CAM_API_TEST"

    # 2. Get All RTSP Cameras Health Endpoint
    health_res = client.get("/rtsp/cameras", headers={"Authorization": "Bearer test-api-key"})
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["success"] is True
    assert any(c["camera_id"] == "CAM_API_TEST" for c in health_data["cameras"])

    # 3. Stop Camera Stream Endpoint
    stop_res = client.post(
        "/rtsp/cameras/stop",
        json={"camera_id": "CAM_API_TEST"},
        headers={"Authorization": "Bearer test-api-key"}
    )
    assert stop_res.status_code == 200
    assert stop_res.json()["stopped"] is True
