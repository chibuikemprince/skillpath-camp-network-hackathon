import mongoose, { Schema } from 'mongoose';

const UserProfileSchema = new Schema({
  targetSkill: { type: String, required: true },
  currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  timePerWeek: { type: Number, required: true },
  goalType: { type: String, enum: ['job-ready', 'exam', 'hobby', 'other'], required: true },
  preferredStyle: { type: String, enum: ['text', 'video', 'mixed'], required: true }
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: { type: UserProfileSchema, required: true }
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);