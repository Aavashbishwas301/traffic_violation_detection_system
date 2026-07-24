import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    designationCode: { type: String, required: true, unique: true },
    designationName: { type: String, required: true },
    rank: { type: String, required: true },
    department: { type: String, required: true },
    hierarchyLevel: { type: Number, required: true },
    minimumServiceYears: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

const Designation = mongoose.model("Designation", designationSchema);
export default Designation;
