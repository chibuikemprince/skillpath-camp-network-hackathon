import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ResourceModel, ProjectModel, ProgressModel } from '../models';

export const getTopicResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topicId, curriculumId } = req.params;
    const resources = await ResourceModel.find({ topicId, curriculumId });

    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
};

export const getModuleProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { moduleId, curriculumId } = req.params;
    const projects = await ProjectModel.find({ moduleId, curriculumId });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
};

export const markResourceCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resourceId } = req.params;
    const userId = req.userId!;

    // Check if resource exists
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Get curriculum ID from resource or user's current curriculum
    let curriculumId = (resource as any).curriculumId;
    
    if (!curriculumId) {
      // Fallback: get user's current curriculum
      const curriculumService = require('../services/curriculumService').default;
      const curriculum = await curriculumService.getCurriculum(userId);
      curriculumId = curriculum?._id;
    }
    
    if (curriculumId) {
      // Log progress
      const progress = new ProgressModel({
        userId,
        curriculumId,
        resourceId,
        type: 'resource_completed'
      });
      await progress.save();
    }

    res.json({ message: 'Resource marked as completed' });
  } catch (error) {
    console.error('Mark resource completed error:', error);
    res.status(500).json({ error: 'Failed to mark resource as completed' });
  }
};

export const markProjectCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.userId!;

    // Check if project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get curriculum ID from project or user's current curriculum
    let curriculumId = (project as any).curriculumId;
    
    if (!curriculumId) {
      // Fallback: get user's current curriculum
      const curriculumService = require('../services/curriculumService').default;
      const curriculum = await curriculumService.getCurriculum(userId);
      curriculumId = curriculum?._id;
    }
    
    if (curriculumId) {
      // Log progress
      const progress = new ProgressModel({
        userId,
        curriculumId,
        projectId,
        type: 'project_completed'
      });
      await progress.save();
    }

    res.json({ message: 'Project marked as completed' });
  } catch (error) {
    console.error('Mark project completed error:', error);
    res.status(500).json({ error: 'Failed to mark project as completed' });
  }
};

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get completed projects
    const completedProjects = await ProgressModel.find({
      userId,
      type: 'project_completed'
    }).populate('projectId');

    // Get completed resources for skill tracking
    const completedResources = await ProgressModel.find({
      userId,
      type: 'resource_completed'
    }).populate('resourceId');

    // Get quiz scores for skill demonstration
    const quizScores = await ProgressModel.find({
      userId,
      type: 'quiz_completed'
    });

    const averageScore = quizScores.length > 0 
      ? Math.round(quizScores.reduce((sum, q) => sum + ((q as any).score || 0), 0) / quizScores.length)
      : 0;

    res.json({
      portfolio: {
        completedProjects: completedProjects.length,
        completedResources: completedResources.length,
        averageQuizScore: averageScore,
        projects: completedProjects,
        skillsLearned: [] // Could be enhanced to track specific skills
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
};