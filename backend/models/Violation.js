import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vehicle",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "VehicleOwner",
    },
    policeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrafficPolice",
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
    },
    violationType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    aiDetected: {
      type: Boolean,
      default: false,
    },
    aiConfidence: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Paid"],
      default: "Pending",
    },
    remarks: {
      type: String,
    },
    violationDateTime: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for frequently queried fields
violationSchema.index({ vehicleId: 1, createdAt: -1 });
violationSchema.index({ ownerId: 1, createdAt: -1 });
violationSchema.index({ status: 1 });
violationSchema.index({ violationDateTime: -1 });

const Violation = mongoose.model("Violation", violationSchema);

export default Violation;
