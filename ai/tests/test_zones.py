import pytest
import numpy as np
from zones import ZoneEvaluator


def test_normalized_coordinates_multi_resolution_scaling():
    """
    Verifies that a normalized zone polygon (0.0 to 1.0) scales and detects collisions
    identically across multiple camera resolutions (720p, 1080p, 4K, and 4:3 legacy CCTV).
    """
    # Define a normalized Stop Line polygon in the lower third of the frame
    stop_line_zone = {
        "zoneId": "ZONE_STOP_01",
        "name": "Maitighar Stop Line",
        "type": "Stop Line",
        "polygon": [
            {"x": 0.20, "y": 0.60},
            {"x": 0.80, "y": 0.60},
            {"x": 0.80, "y": 0.70},
            {"x": 0.20, "y": 0.70}
        ],
        "enabled": True
    }

    resolutions = [
        (1280, 720),   # 720p (16:9)
        (1920, 1080),  # 1080p (16:9)
        (3840, 2160),  # 4K (16:9)
        (1024, 768),   # 4:3 Legacy CCTV
    ]

    for w, h in resolutions:
        # Create vehicle placed proportionally inside the zone (normalized centroid: x=0.5, y=0.65)
        v_x1 = int(0.40 * w)
        v_y1 = int(0.50 * h)
        v_x2 = int(0.60 * w)
        v_y2 = int(0.66 * h)
        vehicle_bbox = [v_x1, v_y1, v_x2, v_y2]

        intersects, pt = ZoneEvaluator.does_bbox_intersect_zone(
            bbox=vehicle_bbox,
            polygon=stop_line_zone["polygon"],
            width=w,
            height=h
        )
        assert intersects is True, f"Failed zone intersection check at resolution {w}x{h}"


def test_stop_line_red_light_trigger():
    """
    Stop Line violation should trigger ONLY when traffic light is Red.
    When light is Green, vehicles crossing the stop line are legal.
    """
    stop_line = {
        "zoneId": "ZONE_STOP",
        "name": "Main Stop Line",
        "type": "Stop Line",
        "polygon": [{"x": 0.1, "y": 0.5}, {"x": 0.9, "y": 0.5}, {"x": 0.9, "y": 0.6}, {"x": 0.1, "y": 0.6}],
        "enabled": True
    }
    vehicle = {
        "class": "car",
        "vehicle_type": "Car",
        "bbox": [100, 480, 250, 560], # Y2=560 intersects 500-600 in 1000h frame
        "confidence": 0.92,
        "track_id": 10
    }

    # 1. Red Light -> Triggers Violation
    violations_red = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle],
        zones=[stop_line],
        light_color="Red",
        img_w=1000,
        img_h=1000
    )
    assert len(violations_red) == 1
    assert violations_red[0]["type"] == "Traffic Light"
    assert violations_red[0]["zone_name"] == "Main Stop Line"

    # 2. Green Light -> No Violation
    violations_green = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle],
        zones=[stop_line],
        light_color="Green",
        img_w=1000,
        img_h=1000
    )
    assert len(violations_green) == 0


def test_zebra_crossing_encroachment():
    """Verifies vehicle stopping inside crosswalk triggers Zebra Crossing citation."""
    zebra_zone = {
        "zoneId": "ZONE_ZEBRA",
        "name": "Pedestrian Crossing",
        "type": "Zebra Crossing",
        "polygon": [{"x": 0.05, "y": 0.70}, {"x": 0.95, "y": 0.70}, {"x": 0.95, "y": 0.90}, {"x": 0.05, "y": 0.90}],
        "enabled": True
    }
    vehicle_in_crosswalk = {
        "class": "motorcycle",
        "vehicle_type": "Bike",
        "bbox": [200, 720, 280, 850],
        "confidence": 0.90,
        "track_id": 14
    }

    violations = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle_in_crosswalk],
        zones=[zebra_zone],
        light_color="Unknown",
        img_w=1000,
        img_h=1000
    )
    assert len(violations) == 1
    assert violations[0]["type"] == "Zebra Crossing"
    assert violations[0]["vehicle_type"] == "Bike"


def test_no_entry_area_trigger():
    """Verifies vehicles entering forbidden one-way polygon trigger citation."""
    no_entry_zone = {
        "zoneId": "ZONE_NO_ENTRY",
        "name": "One Way Exit Ramp",
        "type": "No Entry Area",
        "polygon": [{"x": 0.70, "y": 0.20}, {"x": 0.95, "y": 0.20}, {"x": 0.95, "y": 0.50}, {"x": 0.70, "y": 0.50}],
        "enabled": True
    }
    vehicle = {
        "class": "truck",
        "vehicle_type": "Truck",
        "bbox": [750, 250, 900, 450],
        "confidence": 0.94,
        "track_id": 22
    }

    violations = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle],
        zones=[no_entry_zone],
        light_color="Green",
        img_w=1000,
        img_h=1000
    )
    assert len(violations) == 1
    assert violations[0]["type"] == "No Entry Area"


def test_restricted_area_trigger():
    """Verifies unauthorized vehicles inside security polygon trigger citation."""
    restricted_zone = {
        "zoneId": "ZONE_RESTRICTED",
        "name": "Diplomatic Enclave Lane",
        "type": "Restricted Area",
        "polygon": [{"x": 0.0, "y": 0.0}, {"x": 0.40, "y": 0.0}, {"x": 0.40, "y": 0.40}, {"x": 0.0, "y": 0.40}],
        "enabled": True
    }
    vehicle = {
        "class": "car",
        "vehicle_type": "Car",
        "bbox": [50, 50, 200, 200],
        "confidence": 0.89,
        "track_id": 35
    }

    violations = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle],
        zones=[restricted_zone],
        light_color="Green",
        img_w=1000,
        img_h=1000
    )
    assert len(violations) == 1
    assert violations[0]["type"] == "Restricted Area"


def test_lane_violation_trigger():
    """Verifies non-bus entering public bus priority lane triggers Lane Violation."""
    bus_lane_zone = {
        "zoneId": "ZONE_BUS_LANE",
        "name": "KTM Bus Rapid Transit Lane",
        "type": "Lane",
        "polygon": [{"x": 0.80, "y": 0.10}, {"x": 1.0, "y": 0.10}, {"x": 1.0, "y": 0.90}, {"x": 0.80, "y": 0.90}],
        "enabled": True
    }
    car = {
        "class": "car",
        "vehicle_type": "Car",
        "bbox": [820, 300, 960, 500],
        "confidence": 0.91,
        "track_id": 44
    }

    violations = ZoneEvaluator.evaluate_zones(
        vehicles=[car],
        zones=[bus_lane_zone],
        light_color="Green",
        img_w=1000,
        img_h=1000
    )
    assert len(violations) == 1
    assert violations[0]["type"] == "Lane Violation"


def test_disabled_zone_suppression():
    """Disabled zones (`enabled: false`) must never trigger violation tickets."""
    disabled_zone = {
        "zoneId": "ZONE_DISABLED",
        "name": "Under-Maintenance Crosswalk",
        "type": "Zebra Crossing",
        "polygon": [{"x": 0.1, "y": 0.1}, {"x": 0.9, "y": 0.1}, {"x": 0.9, "y": 0.9}, {"x": 0.1, "y": 0.9}],
        "enabled": False  # Disabled
    }
    vehicle = {
        "class": "car",
        "vehicle_type": "Car",
        "bbox": [300, 300, 500, 500],
        "confidence": 0.95,
        "track_id": 88
    }

    violations = ZoneEvaluator.evaluate_zones(
        vehicles=[vehicle],
        zones=[disabled_zone],
        light_color="Red",
        img_w=1000,
        img_h=1000
    )
    assert len(violations) == 0  # No violation produced for disabled zone
