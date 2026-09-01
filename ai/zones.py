"""
Camera Calibration & Resolution-Independent Dynamic Zone Engine for TVDS.
Supports geometric polygon enforcement for:
- Stop Line
- Zebra Crossing
- Lane
- No-Entry Area
- Restricted Area
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional, Any


class ZoneEvaluator:
    """
    Evaluates vehicle spatial positions against normalized geometric camera zones.
    All polygon vertices are stored as normalized floats (0.0 to 1.0) and denormalized
    dynamically at runtime against the active frame resolution (W, H).
    """

    @staticmethod
    def denormalize_polygon(polygon: List[Dict[str, float]], width: int, height: int) -> np.ndarray:
        """Converts normalized points [{x, y}, ...] to pixel coordinates [[px, py], ...]."""
        pts = []
        for p in polygon:
            x = int(float(p.get('x', p[0] if isinstance(p, (list, tuple)) else 0.0)) * width)
            y = int(float(p.get('y', p[1] if isinstance(p, (list, tuple)) else 0.0)) * height)
            pts.append([x, y])
        return np.array(pts, dtype=np.int32)

    @staticmethod
    def is_point_in_zone(point: Tuple[float, float], polygon_pts: np.ndarray) -> bool:
        """Uses OpenCV ray-casting polygon test to check point containment."""
        if polygon_pts.shape[0] < 3:
            # For 2-point line segments (e.g. Stop Line), check line proximity
            p1 = polygon_pts[0]
            p2 = polygon_pts[1]
            px, py = point
            # Line distance formula
            line_vec = p2 - p1
            p_vec = np.array([px, py]) - p1
            line_len = np.linalg.norm(line_vec)
            if line_len == 0:
                return False
            cross = np.abs(np.cross(line_vec, p_vec)) / line_len
            proj = np.dot(p_vec, line_vec) / (line_len ** 2)
            return (cross <= 20.0) and (0.0 <= proj <= 1.0)

        # Standard polygon containment test
        dist = cv2.pointPolygonTest(polygon_pts, (float(point[0]), float(point[1])), False)
        return dist >= 0

    @classmethod
    def does_bbox_intersect_zone(
        cls,
        bbox: List[float],
        polygon: List[Dict[str, float]],
        width: int,
        height: int
    ) -> Tuple[bool, str]:
        """
        Tests if vehicle bounding box intersects with the normalized zone polygon.
        Checks:
        1. Ground tire contact point: ((x1 + x2) / 2, y2)
        2. Center point: ((x1 + x2) / 2, (y1 + y2) / 2)
        3. Bottom left & bottom right tire points
        """
        poly_pts = cls.denormalize_polygon(polygon, width, height)
        x1, y1, x2, y2 = bbox

        # Key spatial test points (in pixel space)
        ground_contact = ((x1 + x2) / 2.0, y2)
        center_point = ((x1 + x2) / 2.0, (y1 + y2) / 2.0)
        bottom_left = (x1 + (x2 - x1) * 0.20, y2)
        bottom_right = (x2 - (x2 - x1) * 0.20, y2)

        test_points = [
            (ground_contact, "ground_contact"),
            (center_point, "centroid"),
            (bottom_left, "bottom_left"),
            (bottom_right, "bottom_right")
        ]

        for pt, label in test_points:
            if cls.is_point_in_zone(pt, poly_pts):
                return True, label

        return False, "none"

    @classmethod
    def evaluate_zones(
        cls,
        vehicles: List[Dict[str, Any]],
        zones: List[Dict[str, Any]],
        light_color: str,
        img_w: int,
        img_h: int
    ) -> List[Dict[str, Any]]:
        """
        Evaluates all active vehicles against configured camera zones.
        Returns triggered violation candidates.
        """
        triggered_violations = []

        active_zones = [z for z in zones if z.get('enabled', True)]
        if not active_zones:
            return triggered_violations

        for vehicle in vehicles:
            bbox = vehicle.get('bbox', [0, 0, 0, 0])
            v_conf = vehicle.get('confidence', 0.85)
            v_type = vehicle.get('vehicle_type', vehicle.get('class', 'Car'))
            track_id = vehicle.get('track_id') or 1

            for zone in active_zones:
                zone_type = zone.get('type')
                zone_name = zone.get('name', zone_type)
                polygon = zone.get('polygon', [])
                if len(polygon) < 2:
                    continue

                intersects, collision_pt = cls.does_bbox_intersect_zone(bbox, polygon, img_w, img_h)
                if not intersects:
                    continue

                # 1. Stop Line Zone -> Triggers when signal is Red
                if zone_type == "Stop Line":
                    if light_color == "Red":
                        triggered_violations.append({
                            "type": "Traffic Light",
                            "zone_type": "Stop Line",
                            "zone_name": zone_name,
                            "track_id": track_id,
                            "confidence": round(float(v_conf * 0.90), 4),
                            "requiresReview": False,
                            "reviewReason": None,
                            "bbox": bbox,
                            "vehicle_type": v_type
                        })

                # 2. Zebra Crossing Zone -> Triggers when vehicle encroaches pedestrian crosswalk
                elif zone_type == "Zebra Crossing":
                    triggered_violations.append({
                        "type": "Zebra Crossing",
                        "zone_type": "Zebra Crossing",
                        "zone_name": zone_name,
                        "track_id": track_id,
                        "confidence": round(float(v_conf * 0.88), 4),
                        "requiresReview": False,
                        "reviewReason": None,
                        "bbox": bbox,
                        "vehicle_type": v_type
                    })

                # 3. No Entry Area -> Triggers when vehicle enters forbidden zone
                elif zone_type == "No Entry Area":
                    triggered_violations.append({
                        "type": "No Entry Area",
                        "zone_type": "No Entry Area",
                        "zone_name": zone_name,
                        "track_id": track_id,
                        "confidence": round(float(v_conf * 0.92), 4),
                        "requiresReview": False,
                        "reviewReason": None,
                        "bbox": bbox,
                        "vehicle_type": v_type
                    })

                # 4. Restricted Area -> Triggers on security / unauthorized zone entry
                elif zone_type == "Restricted Area":
                    triggered_violations.append({
                        "type": "Restricted Area",
                        "zone_type": "Restricted Area",
                        "zone_name": zone_name,
                        "track_id": track_id,
                        "confidence": round(float(v_conf * 0.90), 4),
                        "requiresReview": False,
                        "reviewReason": None,
                        "bbox": bbox,
                        "vehicle_type": v_type
                    })

                # 5. Lane Enforcement Zone (e.g. Bus lane or solid white line)
                elif zone_type == "Lane":
                    triggered_violations.append({
                        "type": "Lane Violation",
                        "zone_type": "Lane",
                        "zone_name": zone_name,
                        "track_id": track_id,
                        "confidence": round(float(v_conf * 0.85), 4),
                        "requiresReview": False,
                        "reviewReason": None,
                        "bbox": bbox,
                        "vehicle_type": v_type
                    })

        return triggered_violations
