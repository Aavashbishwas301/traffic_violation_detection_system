import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  receiverType: {
    type: String,
    required: true,
    enum: ['Admin', 'TrafficPolice', 'VehicleOwner'],
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverType',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
