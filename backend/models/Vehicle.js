import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "VehicleOwner",
      default: null,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: [
        "Car",
        "Van",
        "Bus",
        "Truck",
        "Bike",
        "Scooter",
        "2-Wheeler",
        "4-Wheeler",
        "Other",
      ],
      default: "4-Wheeler",
    },
    vehicleCategory: {
      type: String,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    color: {
      type: String,
    },
    engineNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    chassisNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    manufactureYear: {
      type: Number,
    },
    registrationDate: {
      type: Date,
    },
    registrationExpiryDate: {
      type: Date,
    },
    insuranceStatus: {
      type: String,
      enum: ["Active", "Expired", "N/A"],
      default: "Active",
    },
    insuranceExpiryDate: {
      type: Date,
    },
    taxStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "N/A"],
      default: "Paid",
    },
    taxExpiryDate: {
      type: Date,
    },
    registrationStatus: {
      type: String,
      enum: ["Registered", "Unregistered", "Pending"],
      default: "Registered",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for frequently queried fields
vehicleSchema.index({ ownerId: 1 });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
