import mongoose from "mongoose";

const violationLineSchema = new mongoose.Schema(
  {
    violationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ViolationType",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    policeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrafficPolice",
    },
    location: { type: String, required: true },
    locationPoint: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    aiDetected: { type: Boolean, default: false },
    aiConfidence: { type: Number },
    appliedFineAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Unverified", "Verified", "Paid", "Contested"],
      default: "Unverified",
    },
    remarks: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "TrafficPolice" },
        date: { type: Date, default: Date.now },
        remarks: { type: String },
      }
    ],
    violationDateTime: { type: Date, required: true },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

violationLineSchema.index({ locationPoint: "2dsphere" });
violationLineSchema.index({ vehicleId: 1, createdAt: -1 });
violationLineSchema.index({ status: 1, createdAt: -1 });
violationLineSchema.index({ policeId: 1, createdAt: -1 });
violationLineSchema.index({ createdAt: -1 });

const ViolationLine = mongoose.model("ViolationLine", violationLineSchema);
export default ViolationLine;
