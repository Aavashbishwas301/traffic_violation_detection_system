import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'VehicleOwner',
  },
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Violation',
  },
  complaintMessage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  adminResponse: {
    type: String,
  },
}, {
  timestamps: true,
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
