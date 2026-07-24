import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    violationLineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ViolationLine",
      required: true,
    },
    policeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrafficPolice",
    },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, unique: true },
    receiptNumber: { type: String },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentDate: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Settlement = mongoose.model("Settlement", settlementSchema);
export default Settlement;
