import mongoose, { Schema } from 'mongoose';

const UserCurriculumProgressSchema = new Schema({
  userId: { type: String, required: true },
  curriculumId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  allModulesPassed: { type: Boolean, default: false },
  minScore: { type: Number, default: 0 },
  eligibleForCertificate: { type: Boolean, default: false },
  certificatePaid: { type: Boolean, default: false },
  certificatePaymentTxHash: { type: String, default: null },
  certificateTokenId: { type: String, default: null },
  certificateMintTxHash: { type: String, default: null },
  walletAddress: { type: String, default: null },
  certificateIssued: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Ensure one record per user-curriculum combination
UserCurriculumProgressSchema.index({ userId: 1, curriculumId: 1 }, { unique: true });

export default mongoose.model('UserCurriculumProgress', UserCurriculumProgressSchema);