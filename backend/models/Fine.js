import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Violation',
  },
  amount: {
    type: Number,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Fine = mongoose.model('Fine', fineSchema);

export default Fine;
