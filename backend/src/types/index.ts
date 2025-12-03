export interface User {
  _id: string;
  email: string;
  password: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  targetSkill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  timePerWeek: number;
  goalType: 'job-ready' | 'exam' | 'hobby' | 'other';
  preferredStyle: 'text' | 'video' | 'mixed';
}

export interface Curriculum {
  _id: string;
  userId: string;
  skill: string;
  modules: Module[];
  weeklyRoadmap: WeeklyPlan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  estimatedWeeks: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Subtopic {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
}

export interface WeeklyPlan {
  week: number;
  topics: string[];
  estimatedHours: number;
  goals: string[];
}

export interface Lesson {
  _id: string;
  subtopicId: string;
  title: string;
  objective: string;
  content: string;
  examples: string[];
  practiceTask: string;
  createdAt: Date;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  questions: Question[];
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  answers: number[];
  score: number;
  completedAt: Date;
}

export type ResourceType = 'book' | 'course' | 'article' | 'video';

export interface Resource {
  _id: string;
  topicId: string;
  type: ResourceType;
  title: string;
  authorOrSource?: string;
  url?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  reason: string;
  description: string;
  createdAt: Date;
}

export interface Project {
  _id: string;
  moduleId: string;
  title: string;
  description: string;
  requirements: string[];
  techStack: string[];
  skillsDemonstrated: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Progress {
  _id: string;
  userId: string;
  lessonId?: string;
  resourceId?: string;
  projectId?: string;
  type: 'lesson_viewed' | 'quiz_completed' | 'resource_completed' | 'project_completed';
  score?: number;
  completedAt: Date;
}

export interface MasteryScore {
  _id: string;
  userId: string;
  topicId: string;
  score: number; // 0-100
  updatedAt: Date;
}

export interface UserCurriculumProgress {
  _id: string;
  userId: string;
  curriculumId: string;
  completed: boolean;
  allModulesPassed: boolean;
  minScore: number;
  eligibleForCertificate: boolean;
  certificatePaid: boolean;
  certificatePaymentTxHash: string | null;
  certificateTokenId: string | null;
  certificateMintTxHash: string | null;
  walletAddress: string | null;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateEligibility {
  eligible: boolean;
  hasPaid: boolean;
  completedAllModules: boolean;
  allTestsPassed: boolean;
  minScore: number;
  requiredMinScore: number;
  reason?: string;
}

export interface CertificateMetadata {
  name: string;
  description: string;
  attributes: {
    skill: string;
    curriculumId: string;
    userId: string;
    userDisplayName: string;
    level: string;
    completionDate: string;
    minScore: number;
    totalModules: number;
    passedModules: number;
  };
}