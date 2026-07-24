import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  violationLineId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ViolationLine',
  },
  evidenceType: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  processedImageUrl: {
    type: String,
  },
  cameraId: {
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
