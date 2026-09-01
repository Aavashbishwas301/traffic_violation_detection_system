"""
ByteTrack Multi-Object Vehicle Tracking & Duplicate-Event Prevention Engine for TVDS.
Maintains persistent track IDs, motion trajectories, occlusion buffers, and ensures
single-event citation emission per vehicle.
"""

from typing import Dict, List, Tuple, Optional, Any, Set
from datetime import datetime, timezone
import math


class VehicleTrack:
    """Represents the lifecycle, trajectory, and violation history of a single vehicle."""

    def __init__(self, track_id: int, vehicle_type: str, bbox: List[float], frame_idx: int):
        self.track_id = int(track_id)
        self.vehicle_type = vehicle_type
        self.first_frame = int(frame_idx)
        self.last_seen_frame = int(frame_idx)
        self.lost_frames = 0
        
        # Geometry & Trajectory
        self.current_bbox = bbox
        self.trajectory: List[Tuple[float, float]] = []
        self._add_centroid(bbox)
        
        # Plate Information
        self.license_plate: str = "Unknown"
        self.plate_confidence: float = 0.0
        
        # Violation Deduplication Registry
        self.violations_triggered: Set[str] = set()
        self.violation_records: List[Dict[str, Any]] = []

    def _add_centroid(self, bbox: List[float]):
        x1, y1, x2, y2 = bbox
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        self.trajectory.append((round(cx, 2), round(cy, 2)))
        # Keep maximum 60 trajectory history points
        if len(self.trajectory) > 60:
            self.trajectory.pop(0)

    def update(self, bbox: List[float], frame_idx: int, vehicle_type: Optional[str] = None):
        self.current_bbox = bbox
        self.last_seen_frame = int(frame_idx)
        self.lost_frames = 0
        self._add_centroid(bbox)
        if vehicle_type and vehicle_type != "Other":
            self.vehicle_type = vehicle_type

    def update_plate(self, plate_number: str, confidence: float):
        if plate_number and plate_number != "Unknown" and confidence >= self.plate_confidence:
            self.license_plate = plate_number
            self.plate_confidence = confidence

    def get_motion_vector(self) -> Tuple[float, float]:
        """Calculates average motion vector (dx, dy) over the last 5 frames."""
        if len(self.trajectory) < 2:
            return 0.0, 0.0
        p_old = self.trajectory[-min(5, len(self.trajectory))]
        p_new = self.trajectory[-1]
        dx = round(p_new[0] - p_old[0], 2)
        dy = round(p_new[1] - p_old[1], 2)
        return dx, dy


class VehicleTrackerManager:
    """
    Manages active vehicle tracks across video streams and prevents duplicate violations.
    """

    def __init__(self, max_lost_frames: int = 30):
        self.max_lost_frames = max_lost_frames
        self.tracks: Dict[int, VehicleTrack] = {}
        self.all_recorded_violations: List[Dict[str, Any]] = []
        self._next_virtual_id = 1

    def update_track(
        self,
        track_id: Optional[int],
        bbox: List[float],
        vehicle_type: str,
        frame_idx: int,
        plate_number: Optional[str] = None,
        plate_confidence: float = 0.0
    ) -> VehicleTrack:
        """
        Updates an existing vehicle track or registers a new vehicle track.
        If track_id is None, generates a temporary virtual track ID.
        """
        if track_id is None:
            track_id = self._next_virtual_id
            self._next_virtual_id += 1
        else:
            track_id = int(track_id)

        if track_id not in self.tracks:
            track = VehicleTrack(track_id, vehicle_type, bbox, frame_idx)
            self.tracks[track_id] = track
        else:
            track = self.tracks[track_id]
            track.update(bbox, frame_idx, vehicle_type)

        if plate_number and plate_number != "Unknown":
            track.update_plate(plate_number, plate_confidence)

        return track

    def register_violation_event(
        self,
        track_id: int,
        violation_type: str,
        confidence: float,
        bbox: List[float],
        frame_idx: int,
        timestamp_str: Optional[str] = None,
        requires_review: bool = False,
        review_reason: Optional[str] = None,
        vehicle_number: Optional[str] = None,
        vehicle_type: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Registers a violation event for a tracked vehicle.
        PREVENTS DUPLICATE EVENT EMISSION: If the same track_id has already triggered
        this violation type, returns None to suppress duplicate citations across video frames.
        """
        track_id = int(track_id)
        if track_id not in self.tracks:
            track = VehicleTrack(track_id, vehicle_type or "Other", bbox, frame_idx)
            self.tracks[track_id] = track
        else:
            track = self.tracks[track_id]

        # Duplicate Check: Has this track already committed this violation?
        if violation_type in track.violations_triggered:
            # Update existing violation record with latest frame visibility
            for record in track.violation_records:
                if record["type"] == violation_type:
                    record["last_frame"] = int(frame_idx)
                    record["frames_visible"] = record.get("frames_visible", 1) + 1
                    record["confidence"] = max(record["confidence"], round(float(confidence), 4))
            return None  # Suppress duplicate emission

        # First time this vehicle is committing this violation
        track.violations_triggered.add(violation_type)

        if not timestamp_str:
            timestamp_str = datetime.now(timezone.utc).isoformat()

        final_plate = vehicle_number or track.license_plate
        final_type = vehicle_type or track.vehicle_type
        dx, dy = track.get_motion_vector()

        violation_record = {
            "type": violation_type,
            "track_id": track_id,
            "confidence": round(float(confidence), 4),
            "requiresReview": bool(requires_review),
            "reviewReason": review_reason,
            "bbox": [round(coord, 2) for coord in bbox],
            "vehicle_number": final_plate,
            "vehicle_type": final_type,
            "first_frame": int(frame_idx),
            "last_frame": int(frame_idx),
            "frames_visible": 1,
            "motion_vector": {"dx": dx, "dy": dy},
            "timestamp": timestamp_str
        }

        track.violation_records.append(violation_record)
        self.all_recorded_violations.append(violation_record)
        return violation_record

    def cleanup_lost_tracks(self, current_frame_idx: int):
        """Removes tracks that have not been seen for more than max_lost_frames."""
        retired_ids = []
        for t_id, track in self.tracks.items():
            if (current_frame_idx - track.last_seen_frame) > self.max_lost_frames:
                retired_ids.append(t_id)

        for t_id in retired_ids:
            del self.tracks[t_id]

    def get_confirmed_plate(self, track_id: Optional[int], min_confidence: float = 0.70) -> Optional[Dict[str, Any]]:
        """
        Returns cached plate information if already recognized with high confidence.
        Allows video & RTSP processing to skip redundant EasyOCR executions.
        """
        if track_id is None:
            return None
        track = self.tracks.get(int(track_id))
        if track and track.license_plate and track.license_plate != "Unknown" and track.plate_confidence >= min_confidence:
            return {
                "plate_number": track.license_plate,
                "confidence": track.plate_confidence
            }
        return None

    def get_summary(self) -> Dict[str, Any]:
        """Returns tracking metrics summary."""
        return {
            "active_tracks": len(self.tracks),
            "unique_violations_recorded": len(self.all_recorded_violations),
            "tracked_vehicles": [
                {
                    "track_id": t.track_id,
                    "vehicle_type": t.vehicle_type,
                    "plate": t.license_plate,
                    "first_frame": t.first_frame,
                    "last_frame": t.last_seen_frame,
                    "violations": list(t.violations_triggered)
                }
                for t in self.tracks.values()
            ]
        }
