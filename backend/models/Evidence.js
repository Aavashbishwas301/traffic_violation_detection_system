import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Violation',
  },
  imageUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  cameraLocation: {
    type: String,
  },
  captureTime: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrafficPolice',
  },
}, {
  timestamps: true,
});

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;
