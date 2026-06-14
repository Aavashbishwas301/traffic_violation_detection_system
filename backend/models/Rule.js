import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
  violationType: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  fineAmount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Rule = mongoose.model('Rule', ruleSchema);

export default Rule;
