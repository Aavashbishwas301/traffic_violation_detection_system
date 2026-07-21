import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vehicleOwnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    citizenshipNumber: {
      type: String,
      unique: true,
    },
    profilePhoto: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Match user entered password to hashed password in database
vehicleOwnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
vehicleOwnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const VehicleOwner = mongoose.model("VehicleOwner", vehicleOwnerSchema);

export default VehicleOwner;
