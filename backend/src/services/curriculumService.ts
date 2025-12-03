import CurriculumModel from '../models/Curriculum';
import { LessonModel, QuizModel, ResourceModel, ProjectModel, ProgressModel, MasteryScoreModel } from '../models';
import llmService from './llmService';
import certificateService from './certificateService';
import { Curriculum, UserProfile } from '../types';

class CurriculumService {
  async createCurriculum(userId: string, profile: UserProfile): Promise<Curriculum> {
    // Generate curriculum using AI
    const curriculumData = await llmService.generateCurriculum(
      profile.targetSkill,
      profile.currentLevel,
      profile.timePerWeek
    );

    // Create and save curriculum
    const curriculum = new CurriculumModel({
      userId,
      skill: profile.targetSkill,
      modules: curriculumData.modules,
      weeklyRoadmap: curriculumData.weeklyRoadmap
    });

    const savedCurriculum = await curriculum.save();
console.log({id: savedCurriculum._id, curriculumData})
    // Generate initial resources and projects for each module
    for (const module of (savedCurriculum as any).modules) {
      // Generate projects for this module
      const projects = await llmService.generateProjects(
        module.title,
        profile.targetSkill,
        profile.currentLevel
      );
// console.log({projects})

      for (const projectData of projects) {
        const project = new ProjectModel({
          ...projectData,
          moduleId: module.id,
          curriculumId: (savedCurriculum as any)._id
        });
        await project.save();
      }

      // Generate resources for each topic
      for (const topic of module.topics) {
        const resources = await llmService.generateResources(
          topic.title,
          profile.targetSkill,
          profile.currentLevel,
          profile.preferredStyle || 'mixed'
        );
// console.log({resources})
        for (const resourceData of resources) {
          const { _id, ...cleanResourceData } = resourceData;
          const resource = new ResourceModel({
            ...cleanResourceData,
            topicId: topic.id,
            curriculumId: (savedCurriculum as any)._id
          });
          await resource.save();
        }
      }
    }

    return (savedCurriculum as any).toObject();
  }

  async getCurriculum(userId: string): Promise<Curriculum | null> {
    const curriculum = await CurriculumModel.findOne({ userId }).sort({ createdAt: -1 });
    return curriculum ? (curriculum as any).toObject() : null;
  }

  async generateLessonForSubtopic(subtopicId: string, subtopic: { title: string, description: string }, skill: string, level: string, curriculumId: string): Promise<any> {
    // Check if lesson already exists
    let lesson = await LessonModel.find({ subtopicId, curriculumId });
    
    if (lesson.length == 0) {
      // Generate new lesson using provided subtopic details
      const lessonData = await llmService.generateLesson(subtopic, skill, level);
      let mylesson = new LessonModel({
        subtopicId,
        ...lessonData,
        curriculumId
      });
      await mylesson.save();

      // Generate quiz for this lesson
      try {
        const questions = await llmService.generateQuiz(lessonData.title, lessonData.content);
        const quiz = new QuizModel({
          lessonId: mylesson._id.toString(),
          questions,
          curriculumId
        });
        await quiz.save();
        return mylesson.toObject();
      } catch (quizError) {
        console.error('Quiz generation failed, using fallback:', quizError);
        const fallbackQuestions = [{
          id: 'q1',
          text: `What is the main concept covered in ${lessonData.title}?`,
          options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
          correctAnswer: 0,
          explanation: 'This covers the main concept of the lesson.'
        }];
        const quiz = new QuizModel({
          lessonId: mylesson._id.toString(),
          questions: fallbackQuestions,
          curriculumId
        });
        await quiz.save();
        return mylesson.toObject();
      }
    }

    return (lesson[0] as any).toObject();
  }

  async getWeeklyPlan(userId: string, week: number): Promise<any> {
    const curriculum = await this.getCurriculum(userId);
    if (!curriculum) return null;

    const weekPlan = curriculum.weeklyRoadmap.find(w => w.week === week);
    if (!weekPlan) return null;

    // Get detailed topic information with subtopics and completion status
    const topicDetails = [];
    for (const topicId of weekPlan.topics) {
      const topic = this.findTopicById(curriculum, topicId);
      if (topic) {
        // Check if topic is completed (all subtopics have lessons completed with 50%+ quiz score)
        let completedSubtopics = 0;
        const totalSubtopics = topic.subtopics.length;
        
        for (const subtopic of topic.subtopics) {
          const lesson = await LessonModel.findOne({ subtopicId: subtopic.id, curriculumId: curriculum._id });
          if (lesson) {
            const lessonProgress = await ProgressModel.findOne({
              userId,
              curriculumId: curriculum._id,
              lessonId: lesson._id.toString(),
              type: 'lesson_completed'
            });
            if (lessonProgress) {
              completedSubtopics++;
            }
          }
        }
        
        const isCompleted = completedSubtopics === totalSubtopics && totalSubtopics > 0;
        
        topicDetails.push({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          difficulty: topic.difficulty,
          subtopics: topic.subtopics || [],
          isCompleted,
          completedSubtopics,
          totalSubtopics
        });
      }
    }

    return {
      week: weekPlan.week,
      topics: weekPlan.topics,
      estimatedHours: weekPlan.estimatedHours,
      goals: weekPlan.goals,
      topicDetails
    };
  }

  async updateMasteryScore(userId: string, topicId: string, score: number): Promise<void> {
    await MasteryScoreModel.findOneAndUpdate(
      { userId, topicId },
      { score, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async markWeekCompleted(userId: string, week: number): Promise<void> {
    const curriculum = await this.getCurriculum(userId);
    if (!curriculum) throw new Error('No curriculum found');
    
    const curriculumId = curriculum._id;
    const weekPlan = curriculum.weeklyRoadmap.find(w => w.week === week);
    if (!weekPlan) throw new Error('Week not found');
    
    // Check if all lessons in this week are viewed and quizzes passed with 50%+
    const weekTopics = weekPlan.topics;
    const allSubtopics = [];
    
    for (const topicId of weekTopics) {
      const topic = this.findTopicById(curriculum, topicId);
      if (topic) {
        allSubtopics.push(...topic.subtopics);
      }
    }
    
    let totalSubtopics = allSubtopics.length;


    let totalCompleted = 0;
    // Check lesson completion for all subtopics
    for (const subtopic of allSubtopics) {
      const lesson = await LessonModel.findOne({ subtopicId: subtopic.id, curriculumId });
      if (!lesson) continue;
      
      // Check if lesson was completed (quiz passed with 50%+)
      const lessonProgress = await ProgressModel.findOne({
        userId,
        curriculumId,
        lessonId: lesson._id.toString(),
        type: 'lesson_completed'
      });
      
      if (lessonProgress) {
        totalCompleted++;
      }
    }
    

    console.log({totalSubtopics, totalCompleted})



    if (totalCompleted !== totalSubtopics) {
      throw new Error(`Only ${totalCompleted} out of ${totalSubtopics} lessons completed for this week`);
    }
    // Mark week as completed
    const progress = new ProgressModel({
      userId,
      curriculumId,
      type: 'week_completed',
      score: week,
      completedAt: new Date()
    });
    await progress.save();
    
    // Update certificate eligibility
    await certificateService.updateProgressAndCheckEligibility(userId, curriculumId);
  }
  
  async getCompletedWeeks(userId: string): Promise<number[]> {
    const curriculum = await this.getCurriculum(userId);
    if (!curriculum) return [];
    
    const completedWeeks = await ProgressModel.find({
      userId,
      curriculumId: curriculum._id,
      type: 'week_completed'
    });
    
    return completedWeeks.map(w => (w as any).score).sort((a, b) => a - b);
  }

  async getProgressDashboard(userId: string): Promise<any> {
    const curriculum = await this.getCurriculum(userId);
    if (!curriculum) return null;

    // Get all progress records
    const progress = await ProgressModel.find({ userId, curriculumId: curriculum._id });
    const masteryScores = await MasteryScoreModel.find({ userId });
    const completedWeeks = await this.getCompletedWeeks(userId);

    // Calculate completion percentages
    const totalLessons = this.countTotalSubtopics(curriculum);
    const completedLessons = progress.filter(p => (p as any).type === 'lesson_completed').length;
    const completedQuizzes = progress.filter(p => (p as any).type === 'quiz_completed').length;

    // Current week is the next week after the last completed week, or week 1
    const currentWeek = completedWeeks.length > 0 ? completedWeeks[completedWeeks.length - 1] + 1 : 1;
    const maxWeek = Math.min(currentWeek, curriculum.weeklyRoadmap.length);

    return {
      overallProgress: Math.round((completedWeeks.length / curriculum.weeklyRoadmap.length) * 100),
      currentWeek: maxWeek,
      completedLessons,
      completedQuizzes,
      completedWeeks,
      totalWeeks: curriculum.weeklyRoadmap.length,
      masteryScores: masteryScores.reduce((acc, ms) => {
        acc[(ms as any).topicId] = (ms as any).score;
        return acc;
      }, {} as Record<string, number>),
      weeklyRoadmap: curriculum.weeklyRoadmap
    };
  }

  private findTopicById(curriculum: Curriculum, topicId: string): any {
    for (const module of curriculum.modules) {
      const topic = module.topics.find(t => t.id === topicId);
      if (topic) return topic;
    }
    return null;
  }

  private findSubtopicById(curriculum: any, subtopicId: string): any {
    for (const module of curriculum.modules) {
      for (const topic of module.topics) {
        const subtopic = topic.subtopics.find((s: any) => s.id === subtopicId);
        if (subtopic) return subtopic;
      }
    }
    return null;
  }

  private countTotalSubtopics(curriculum: Curriculum): number {
    return curriculum.modules.reduce((total, module) => {
      return total + module.topics.reduce((topicTotal, topic) => {
        return topicTotal + topic.subtopics.length;
      }, 0);
    }, 0);
  }
}

export default new CurriculumService();