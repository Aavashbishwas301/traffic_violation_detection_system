import CameraZone from "../models/CameraZone.js";
import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_API_KEY = process.env.AI_API_KEY || "tvds-ai-key-dev";

// Seed default camera zone calibration if empty
const DEFAULT_CAMERAS = [
  {
    cameraId: "CAM_01_MAITIGHAR",
    name: "Maitighar Mandala - North Approach",
    location: "Maitighar, Kathmandu",
    feedUrl: "rtsp://cctv.traffic.gov.np/maitighar_north",
    referenceImageUrl: "/uploads/camera_calibration_default.png",
    resolution: { width: 1920, height: 1080 },
    rtspStatus: "OFFLINE",
    fps: 0,
    sampleRate: 2,
    reconnectCount: 0,
    zones: [
      {
        zoneId: "ZONE_STOP_01",
        name: "Primary Stop Line",
        type: "Stop Line",
        polygon: [
          { x: 0.15, y: 0.65 },
          { x: 0.85, y: 0.65 },
          { x: 0.85, y: 0.68 },
          { x: 0.15, y: 0.68 }
        ],
        enabled: true,
        rules: { fineType: "Traffic Light Violation", triggerOnRedLight: true }
      },
      {
        zoneId: "ZONE_ZEBRA_01",
        name: "Pedestrian Crosswalk Crossing",
        type: "Zebra Crossing",
        polygon: [
          { x: 0.10, y: 0.69 },
          { x: 0.90, y: 0.69 },
          { x: 0.95, y: 0.85 },
          { x: 0.05, y: 0.85 }
        ],
        enabled: true,
        rules: { fineType: "Zebra Crossing Violation", triggerOnRedLight: false }
      },
      {
        zoneId: "ZONE_NOENTRY_01",
        name: "Right-turn One Way Lane",
        type: "No Entry Area",
        polygon: [
          { x: 0.75, y: 0.30 },
          { x: 0.98, y: 0.30 },
          { x: 0.98, y: 0.60 },
          { x: 0.75, y: 0.60 }
        ],
        enabled: false,
        rules: { fineType: "No Entry Violation", triggerOnRedLight: false }
      }
    ]
  }
];

export const getCameraZones = async (req, res) => {
  try {
    let cameras = await CameraZone.find().sort({ createdAt: -1 });
    if (cameras.length === 0) {
      cameras = await CameraZone.insertMany(DEFAULT_CAMERAS);
    }
    res.json({ success: true, cameras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCameraZoneById = async (req, res) => {
  try {
    const { cameraId } = req.params;
    let camera = await CameraZone.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }
    res.json({ success: true, camera });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveCameraZone = async (req, res) => {
  try {
    const { cameraId, name, location, feedUrl, referenceImageUrl, resolution, zones, sampleRate } = req.body;

    if (!cameraId || !name) {
      return res.status(400).json({ success: false, message: "Camera ID and Name are required" });
    }

    const updatedCamera = await CameraZone.findOneAndUpdate(
      { cameraId },
      {
        $set: {
          name,
          location: location || "Kathmandu Intersection",
          feedUrl: feedUrl || "",
          referenceImageUrl: referenceImageUrl || "",
          resolution: resolution || { width: 1920, height: 1080 },
          sampleRate: sampleRate || 2,
          zones: zones || [],
          createdBy: req.user?._id
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Camera zone configuration saved successfully",
      camera: updatedCamera
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleZoneStatus = async (req, res) => {
  try {
    const { cameraId, zoneId } = req.params;
    const { enabled } = req.body;

    const camera = await CameraZone.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }

    const targetZone = camera.zones.find(z => z.zoneId === zoneId || z._id.toString() === zoneId);
    if (!targetZone) {
      return res.status(404).json({ success: false, message: "Zone not found" });
    }

    targetZone.enabled = typeof enabled === "boolean" ? enabled : !targetZone.enabled;
    await camera.save();

    res.json({
      success: true,
      message: `Zone "${targetZone.name}" ${targetZone.enabled ? "enabled" : "disabled"}`,
      zone: targetZone
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { cameraId, zoneId } = req.params;

    const camera = await CameraZone.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }

    camera.zones = camera.zones.filter(z => z.zoneId !== zoneId && z._id.toString() !== zoneId);
    await camera.save();

    res.json({ success: true, message: "Zone deleted successfully", camera });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCamera = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const deleted = await CameraZone.findOneAndDelete({ cameraId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }
    res.json({ success: true, message: "Camera configuration deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- RTSP STREAM CONTROL & HEALTH PROXIES ---

export const startCameraStream = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const camera = await CameraZone.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }

    if (!camera.feedUrl) {
      return res.status(400).json({ success: false, message: "No RTSP feed URL configured for this camera" });
    }

    camera.rtspStatus = "CONNECTING";
    await camera.save();

    // Call AI vision service
    try {
      await axios.post(
        `${AI_SERVICE_URL}/rtsp/cameras/start`,
        {
          camera_id: camera.cameraId,
          rtsp_url: camera.feedUrl,
          zones: camera.zones || [],
          sample_rate_fps: camera.sampleRate || 2.0
        },
        {
          headers: { Authorization: `Bearer ${AI_API_KEY}` },
          timeout: 5000
        }
      );
    } catch (aiErr) {
      console.warn("AI Service RTSP start notification failed:", aiErr.message);
    }

    res.json({
      success: true,
      message: `RTSP Stream initiated for ${camera.name}`,
      camera
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const stopCameraStream = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const camera = await CameraZone.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }

    camera.rtspStatus = "OFFLINE";
    camera.fps = 0;
    await camera.save();

    // Call AI service to stop worker thread
    try {
      await axios.post(
        `${AI_SERVICE_URL}/rtsp/cameras/stop`,
        { camera_id: camera.cameraId },
        {
          headers: { Authorization: `Bearer ${AI_API_KEY}` },
          timeout: 5000
        }
      );
    } catch (aiErr) {
      console.warn("AI Service RTSP stop notification failed:", aiErr.message);
    }

    res.json({
      success: true,
      message: `RTSP Stream stopped for ${camera.name}`,
      camera
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncStreamHealth = async (req, res) => {
  try {
    let aiTelemetry = [];
    try {
      const { data } = await axios.get(`${AI_SERVICE_URL}/rtsp/cameras`, {
        headers: { Authorization: `Bearer ${AI_API_KEY}` },
        timeout: 3000
      });
      aiTelemetry = data?.cameras || [];
    } catch (aiErr) {
      // AI service might be offline or idle
    }

    const cameras = await CameraZone.find();
    for (const cam of cameras) {
      const match = aiTelemetry.find(t => t.camera_id === cam.cameraId);
      if (match) {
        cam.rtspStatus = match.status;
        cam.fps = match.fps;
        cam.processedFrames = match.processed_frames;
        cam.reconnectCount = match.reconnect_count;
        cam.lastActive = match.last_active ? new Date(match.last_active) : cam.lastActive;
        cam.lastError = match.last_error || "";
        await cam.save();
      }
    }

    const updatedCameras = await CameraZone.find().sort({ createdAt: -1 });
    res.json({ success: true, cameras: updatedCameras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
