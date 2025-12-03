import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import curriculumService from '../services/curriculumService';
import User from '../models/User';

export const createCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate curriculum
    const curriculum = await curriculumService.createCurriculum(userId, user.profile);

    res.json({
      message: 'Curriculum created successfully',
      curriculum
    });
  } catch (error) {
    console.error('Curriculum creation error:', error);
    res.status(500).json({ error: 'Failed to create curriculum' });
  }
};

export const getCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const curriculum = await curriculumService.getCurriculum(userId);

    if (!curriculum) {
      res.status(404).json({ error: 'No curriculum found' });
      return;
    }

    res.json({ curriculum });
  } catch (error) {
    console.error('Get curriculum error:', error);
    res.status(500).json({ error: 'Failed to get curriculum' });
  }
};

export const getWeeklyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const week = parseInt(req.params.week);

    const weeklyPlan = await curriculumService.getWeeklyPlan(userId, week);

    if (!weeklyPlan) {
      res.status(404).json({ error: 'Weekly plan not found' });
      return;
    }

    res.json({ weeklyPlan });
  } catch (error) {
    console.error('Get weekly plan error:', error);
    res.status(500).json({ error: 'Failed to get weekly plan' });
  }
};

export const getProgressDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const dashboard = await curriculumService.getProgressDashboard(userId);

    if (!dashboard) {
      res.status(404).json({ error: 'No progress data found' });
      return;
    }

    res.json({ dashboard });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};

export const completeWeek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { week } = req.params;
    
    await curriculumService.markWeekCompleted(userId, parseInt(week));
    
    res.json({ message: 'Week marked as completed' });
  } catch (error) {
    console.error('Complete week error:', error);
    res.status(500).json({ error: 'Failed to complete week' });
  }
};

export const getWeekStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { week } = req.params;
    
    const completedWeeks = await curriculumService.getCompletedWeeks(userId);
    const isCompleted = completedWeeks.includes(parseInt(week));
    
    res.json({ isCompleted });
  } catch (error) {
    console.error('Get week status error:', error);
    res.status(500).json({ error: 'Failed to get week status' });
  }
};