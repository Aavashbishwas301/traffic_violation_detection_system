import mongoose from "mongoose";

const violationTypeSchema = new mongoose.Schema(
  {
    trafficRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
      required: true,
    },
    violationName: { type: String, required: true },
    description: { type: String },
    severityLevel: { type: String },
    isAIEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ViolationType = mongoose.model("ViolationType", violationTypeSchema);
export default ViolationType;
