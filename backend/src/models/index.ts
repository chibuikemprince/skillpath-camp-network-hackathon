import mongoose, { Schema } from 'mongoose';

// Lesson Model
const LessonSchema = new Schema({
  subtopicId: { type: String, required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  content: { type: String, required: true },
  examples: [{ type: String }],
  practiceTask: { type: String, required: true },
  curriculumId: { type: String, required: true }
}, { timestamps: true });

// Quiz Model
const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true }
});

const QuizSchema = new Schema({
  lessonId: { type: String, required: true },
  questions: [QuestionSchema],
  curriculumId: { type: String, required: true }
}, { timestamps: true });

// Quiz Attempt Model
const QuizAttemptSchema = new Schema({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  answers: [{ type: Number, required: true }],
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

// Resource Model
const ResourceSchema = new Schema({
  topicId: { type: String, required: true },
  type: { type: String, enum: ['book', 'course', 'article', 'video'], required: true },
  title: { type: String, required: true },
  authorOrSource: { type: String },
  url: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  estimatedTime: { type: String },
  reason: { type: String, required: true },
  description: { type: String, required: true },
   curriculumId: { type: String, required: true }
}, { timestamps: true });

// Project Model
const ProjectSchema = new Schema({
  moduleId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String, required: true }],
  techStack: [{ type: String, required: true }],
  skillsDemonstrated: [{ type: String, required: true }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
   curriculumId: { type: String, required: true }
});

// Progress Model
const ProgressSchema = new Schema({
  userId: { type: String, required: true },
  curriculumId: { type: String, required: true },
  lessonId: { type: String },
  resourceId: { type: String },
  projectId: { type: String },
  quizId: { type: String },
  type: { type: String, enum: ['lesson_viewed', 'lesson_completed', 'quiz_completed', 'resource_completed', 'project_completed', 'week_completed'], required: true },
  score: { type: Number },
  completedAt: { type: Date, default: Date.now }
});

// Mastery Score Model
const MasteryScoreSchema = new Schema({
  userId: { type: String, required: true },
  topicId: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  updatedAt: { type: Date, default: Date.now }
});

export const LessonModel = mongoose.model('Lesson', LessonSchema);
export const QuizModel = mongoose.model('Quiz', QuizSchema);
export const QuizAttemptModel = mongoose.model('QuizAttempt', QuizAttemptSchema);
export const ResourceModel = mongoose.model('Resource', ResourceSchema);
export const ProjectModel = mongoose.model('Project', ProjectSchema);
export const ProgressModel = mongoose.model('Progress', ProgressSchema);
export const MasteryScoreModel = mongoose.model('MasteryScore', MasteryScoreSchema);