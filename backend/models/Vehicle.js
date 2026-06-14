import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'VehicleOwner',
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Van', 'Bus', 'Truck', 'Bike', 'Scooter', '2-Wheeler', '4-Wheeler', 'Other'],
    default: '4-Wheeler',
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
  },
  chassisNumber: {
    type: String,
    unique: true,
  },
  manufactureYear: {
    type: Number,
  },
  registrationDate: {
    type: Date,
  },
  insuranceStatus: {
    type: String,
    enum: ['Active', 'Expired', 'N/A'],
    default: 'Active',
  },
  taxStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'N/A'],
    default: 'Paid',
  },
}, {
  timestamps: true,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
