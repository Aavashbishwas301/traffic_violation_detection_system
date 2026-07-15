import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    fineId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Fine",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "VehicleOwner",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Khalti", "eSewa", "ConnectIPS", "Card", "Cash"],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for frequently queried fields
paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ fineId: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
