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
    latitude: { type: Number },
    longitude: { type: Number },
    aiDetected: { type: Boolean, default: false },
    aiConfidence: { type: Number },
    appliedFineAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Unverified", "Verified", "Paid", "Contested"],
      default: "Unverified",
    },
    remarks: { type: String },
    violationDateTime: { type: Date, required: true },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

const ViolationLine = mongoose.model("ViolationLine", violationLineSchema);
export default ViolationLine;
