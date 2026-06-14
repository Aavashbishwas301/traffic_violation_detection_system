import mongoose from 'mongoose';

const drivingLicenseSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'VehicleOwner',
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  licenseCategory: {
    type: String,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const DrivingLicense = mongoose.model('DrivingLicense', drivingLicenseSchema);

export default DrivingLicense;
