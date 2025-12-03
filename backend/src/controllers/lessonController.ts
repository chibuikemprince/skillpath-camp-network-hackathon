import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LessonModel, QuizModel, QuizAttemptModel, ProgressModel } from '../models';
import curriculumService from '../services/curriculumService';
import certificateService from '../services/certificateService';
import User from '../models/User';

export const getLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const lesson = await LessonModel.findById(lessonId);

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Get curriculum ID from lesson or user's current curriculum
    let curriculumId = (lesson as any).curriculumId;
    
    if (!curriculumId) {
      // Fallback: get user's current curriculum
      const curriculum = await curriculumService.getCurriculum(req.userId!);
      curriculumId = curriculum?._id;
    }
    
    if (curriculumId) {
      // Check if lesson view already exists
      const existingView = await ProgressModel.findOne({
        userId: req.userId!,
        curriculumId,
        lessonId,
        type: 'lesson_viewed'
      });
      
      if (!existingView) {
        // Log lesson view only if not already viewed
        const progress = new ProgressModel({
          userId: req.userId!,
          curriculumId,
          lessonId,
          type: 'lesson_viewed'
        });
        await progress.save();
      }
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
};

export const generateLessonForSubtopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subtopicId, curriculumId } = req.params;
    const { subtopic } = req.body;
    const userId = req.userId!;

    // Get user profile for context
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const lesson = await curriculumService.generateLessonForSubtopic(
      subtopicId,
      subtopic,
      (user as any).profile.targetSkill,
      (user as any).profile.currentLevel,
      curriculumId
    );

    // Check if lesson view already exists
    const existingView = await ProgressModel.findOne({
      userId: req.userId!,
      curriculumId,
      lessonId: lesson._id,
      type: 'lesson_viewed'
    });
    
    if (!existingView) {
      const progress = new ProgressModel({
        userId: req.userId!,
        curriculumId,
        lessonId: lesson._id,
        type: 'lesson_viewed'
      });
      await progress.save();
    }

    //console.log({lesson, progress})
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Generate lesson error:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
};

export const getQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const quiz = await QuizModel.findOne({ lessonId });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Return quiz without correct answers
    const quizForUser = {
      _id: quiz._id,
      lessonId: (quiz as any).lessonId,
      questions: (quiz as any).questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        options: q.options
      }))
    };

    res.json({ quiz: quizForUser });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.userId!;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    const results = (quiz as any).questions.map((question: any, index: number) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.id,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / (quiz as any).questions.length) * 100);

    // Save quiz attempt
    const attempt = new QuizAttemptModel({
      userId,
      quizId,
      answers,
      score
    });
    await attempt.save();

    // Get curriculum ID from quiz or user's current curriculum
    let curriculumId = (quiz as any).curriculumId;
    
    if (!curriculumId) {
      // Fallback: get user's current curriculum
      const curriculum = await curriculumService.getCurriculum(userId);
      curriculumId = curriculum?._id;
    }
    
    if (curriculumId) {
      // Check if user already has a quiz attempt for this quiz
      const existingAttempt = await ProgressModel.findOne({
        userId,
        curriculumId,
        quizId,
        type: 'quiz_completed'
      });
      
      if (existingAttempt && score > ((existingAttempt as any).score || 0)) {
        // Update existing attempt if new score is higher
        await ProgressModel.findByIdAndUpdate(existingAttempt._id, { score, completedAt: new Date() });
      } else if (!existingAttempt) {
        // Create new progress record
        const progress = new ProgressModel({
          userId,
          curriculumId,
          quizId,
          type: 'quiz_completed',
          score
        });
        await progress.save();
      }
      
      // Mark lesson as completed if quiz score is 50% or higher
      if (score >= 50) {
        const lessonId = (quiz as any).lessonId;
        const existingCompletion = await ProgressModel.findOne({
          userId,
          curriculumId,
          lessonId,
          type: 'lesson_completed'
        });
        
        if (!existingCompletion) {
          const lessonCompletion = new ProgressModel({
            userId,
            curriculumId,
            lessonId,
            type: 'lesson_completed',
            score
          });
          await lessonCompletion.save();
        }
      }
    }

    // Update certificate eligibility after quiz completion
    if (curriculumId) {
      await certificateService.updateProgressAndCheckEligibility(userId, curriculumId);
    }
    
    res.json({
      score,
      results,
      message: score >= 70 ? 'Great job!' : 'Keep practicing!'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};