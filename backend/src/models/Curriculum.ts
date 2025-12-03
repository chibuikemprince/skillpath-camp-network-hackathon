import mongoose, { Schema } from 'mongoose';

const SubtopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  estimatedHours: { type: Number, required: true }
});

const TopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subtopics: [SubtopicSchema],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
 
});

const ModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  topics: [TopicSchema],
  estimatedWeeks: { type: Number, required: true }
});

const WeeklyPlanSchema = new Schema({
  week: { type: Number, required: true },
  topics: [{ type: String, required: true }],
  estimatedHours: { type: Number, required: true },
  goals: [{ type: String, required: true }]
});

const CurriculumSchema = new Schema({
  userId: { type: String, required: true },
  skill: { type: String, required: true },
  modules: [ModuleSchema],
  weeklyRoadmap: [WeeklyPlanSchema]
}, {
  timestamps: true
});

export default mongoose.model('Curriculum', CurriculumSchema);