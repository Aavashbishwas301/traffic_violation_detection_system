import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const trafficPoliceSchema = new mongoose.Schema(
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
    badgeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    rank: {
      type: String,
    },
    designation: {
      type: String,
    },
    station: {
      type: String,
    },
    joiningDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
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
trafficPoliceSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
trafficPoliceSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const TrafficPolice = mongoose.model("TrafficPolice", trafficPoliceSchema);

export default TrafficPolice;
