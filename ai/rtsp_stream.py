"""
Live RTSP CCTV Stream Ingestion, Threaded Sampling, and Resilient Reconnection Engine for TVDS.
Ensures camera thread isolation, buffer lag prevention, auto-reconnect backoff, and health telemetry.
"""

import cv2
import time
import threading
import logging
from typing import Dict, Optional, Any, Callable, List
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TVDS-RTSP")


class RTSPStreamWorker:
    """
    Dedicated worker thread handling an individual RTSP/CCTV camera stream.
    Features:
    - Isolated execution (failures in one camera cannot crash the system).
    - Auto-reconnect with exponential backoff.
    - Real-time buffer clearing (CAP_PROP_BUFFERSIZE = 1) to eliminate video delay.
    - Configurable frame sampling rate.
    """

    def __init__(
        self,
        camera_id: str,
        rtsp_url: str,
        zones: Optional[List[Dict[str, Any]]] = None,
        sample_rate_fps: float = 2.0,
        process_callback: Optional[Callable[[Any, str, List[Dict[str, Any]], int], Any]] = None
    ):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.zones = zones or []
        self.sample_rate_fps = max(0.5, float(sample_rate_fps))
        self.process_callback = process_callback

        # State & Health Telemetry
        self.status = "OFFLINE"  # OFFLINE, CONNECTING, ONLINE, RECONNECTING, ERROR, STOPPED
        self.fps = 0.0
        self.processed_frames = 0
        self.reconnect_count = 0
        self.start_time: Optional[float] = None
        self.last_active: Optional[str] = None
        self.last_error: Optional[str] = None

        self._is_running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

    def start(self):
        with self._lock:
            if self._is_running:
                return
            self._is_running = True
            self.status = "CONNECTING"
            self.start_time = time.time()
            self._thread = threading.Thread(target=self._run_loop, name=f"RTSP-{self.camera_id}", daemon=True)
            self._thread.start()
            logger.info(f"Started RTSP worker thread for camera: {self.camera_id}")

    def stop(self):
        with self._lock:
            self._is_running = False
            self.status = "STOPPED"
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        logger.info(f"Stopped RTSP worker thread for camera: {self.camera_id}")

    def _run_loop(self):
        frame_idx = 0
        sample_interval = 1.0 / self.sample_rate_fps
        last_sample_time = 0.0
        fps_timer = time.time()
        fps_frame_count = 0

        while self._is_running:
            cap = None
            try:
                self.status = "CONNECTING" if self.reconnect_count == 0 else "RECONNECTING"
                logger.info(f"Connecting to RTSP source: {self.camera_id} ({self.rtsp_url})")

                cap = cv2.VideoCapture(self.rtsp_url)
                # Minimize internal buffer to prevent queue delay
                try:
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                except Exception:
                    pass

                if not cap.isOpened():
                    raise ConnectionError(f"Could not open RTSP stream at: {self.rtsp_url}")

                self.status = "ONLINE"
                self.last_error = None
                logger.info(f"Camera {self.camera_id} is ONLINE")

                while self._is_running:
                    ret, frame = cap.read()
                    if not ret or frame is None:
                        raise ConnectionResetError("RTSP stream read returned empty frame or stream disconnected")

                    now = time.time()
                    # Calculate live input FPS
                    fps_frame_count += 1
                    if now - fps_timer >= 1.0:
                        self.fps = round(fps_frame_count / (now - fps_timer), 1)
                        fps_frame_count = 0
                        fps_timer = now

                    # Sample frame at configured sample_rate_fps interval
                    if (now - last_sample_time) >= sample_interval:
                        last_sample_time = now
                        frame_idx += 1
                        self.processed_frames += 1
                        self.last_active = datetime.now(timezone.utc).isoformat()

                        if self.process_callback:
                            try:
                                self.process_callback(frame, self.camera_id, self.zones, frame_idx)
                            except Exception as proc_err:
                                logger.error(f"Inference error in camera {self.camera_id}: {proc_err}")

                    # Brief sleep to avoid CPU spinning
                    time.sleep(0.005)

            except Exception as e:
                self.last_error = str(e)
                logger.warning(f"RTSP connection error on camera {self.camera_id}: {e}")
                if not self._is_running:
                    break

                self.reconnect_count += 1
                self.status = "RECONNECTING"
                # Exponential backoff (2s -> 4s -> 8s -> max 20s)
                backoff = min(20.0, 2.0 ** min(self.reconnect_count, 4))
                logger.info(f"Camera {self.camera_id} will retry in {backoff:.1f}s (Attempt #{self.reconnect_count})")
                time.sleep(backoff)

            finally:
                if cap is not None:
                    cap.release()

        self.status = "OFFLINE"

    def get_status(self) -> Dict[str, Any]:
        uptime = round(time.time() - self.start_time, 1) if (self.start_time and self.status == "ONLINE") else 0.0
        return {
            "camera_id": self.camera_id,
            "status": self.status,
            "rtsp_url": self.rtsp_url,
            "fps": self.fps,
            "sample_rate_fps": self.sample_rate_fps,
            "processed_frames": self.processed_frames,
            "reconnect_count": self.reconnect_count,
            "uptime_seconds": uptime,
            "last_active": self.last_active,
            "last_error": self.last_error
        }


class RTSPStreamManager:
    """
    Central manager controlling all camera RTSP stream worker threads.
    """

    def __init__(self):
        self.workers: Dict[str, RTSPStreamWorker] = {}
        self._lock = threading.Lock()

    def start_camera_stream(
        self,
        camera_id: str,
        rtsp_url: str,
        zones: Optional[List[Dict[str, Any]]] = None,
        sample_rate_fps: float = 2.0,
        process_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        with self._lock:
            # Stop existing worker if running
            if camera_id in self.workers:
                self.workers[camera_id].stop()

            worker = RTSPStreamWorker(
                camera_id=camera_id,
                rtsp_url=rtsp_url,
                zones=zones,
                sample_rate_fps=sample_rate_fps,
                process_callback=process_callback
            )
            self.workers[camera_id] = worker
            worker.start()
            return worker.get_status()

    def stop_camera_stream(self, camera_id: str) -> bool:
        with self._lock:
            if camera_id in self.workers:
                self.workers[camera_id].stop()
                del self.workers[camera_id]
                return True
            return False

    def get_camera_status(self, camera_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            if camera_id in self.workers:
                return self.workers[camera_id].get_status()
            return None

    def get_all_statuses(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [w.get_status() for w in self.workers.values()]

    def stop_all(self):
        with self._lock:
            for w in self.workers.values():
                w.stop()
            self.workers.clear()


# Global singleton instance
global_rtsp_manager = RTSPStreamManager()
