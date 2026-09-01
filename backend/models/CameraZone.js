import mongoose from "mongoose";

const zonePointSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  y: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
}, { _id: false });

const zoneConfigSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["Stop Line", "Zebra Crossing", "Lane", "No Entry Area", "Restricted Area"]
  },
  polygon: {
    type: [zonePointSchema],
    required: true,
    validate: [val => val.length >= 2, "Polygon must contain at least 2 points"]
  },
  enabled: {
    type: Boolean,
    default: true
  },
  rules: {
    fineType: {
      type: String,
      default: ""
    },
    triggerOnRedLight: {
      type: Boolean,
      default: false
    }
  }
});

const cameraZoneSchema = new mongoose.Schema({
  cameraId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: "Kathmandu Valley Intersection"
  },
  feedUrl: {
    type: String,
    default: ""
  },
  referenceImageUrl: {
    type: String,
    default: ""
  },
  resolution: {
    width: { type: Number, default: 1920 },
    height: { type: Number, default: 1080 }
  },
  rtspStatus: {
    type: String,
    enum: ["ONLINE", "CONNECTING", "RECONNECTING", "OFFLINE", "ERROR", "STOPPED"],
    default: "OFFLINE"
  },
  fps: {
    type: Number,
    default: 0
  },
  sampleRate: {
    type: Number,
    default: 2
  },
  processedFrames: {
    type: Number,
    default: 0
  },
  reconnectCount: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date
  },
  lastError: {
    type: String,
    default: ""
  },
  zones: [zoneConfigSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

const CameraZone = mongoose.model("CameraZone", cameraZoneSchema);
export default CameraZone;
