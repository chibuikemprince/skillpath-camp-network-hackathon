import UserCurriculumProgress from '../models/Certificate';
import CurriculumModel from '../models/Curriculum';
import User from '../models/User';
import { ProgressModel, QuizAttemptModel } from '../models';
import { CertificateEligibility, CertificateMetadata } from '../types';

class CertificateService {
  async updateProgressAndCheckEligibility(userId: string, curriculumId: string): Promise<void> {
    const curriculum = await CurriculumModel.findById(curriculumId);
    if (!curriculum) return;

    // Get all quiz attempts for this user and curriculum
    const quizAttempts = await QuizAttemptModel.find({ userId });
    
    // Get all progress records for lessons
    const lessonProgress = await ProgressModel.find({
      userId,
      curriculumId,
      type: 'lesson_completed'
    });

    // Calculate total modules and subtopics
    const totalSubtopics = curriculum.modules.reduce((total: number, module: any) => {
      return total + module.topics.reduce((topicTotal: number, topic: any) => {
        return topicTotal + topic.subtopics.length;
      }, 0);
    }, 0);

    const totalModules = curriculum.modules.length;

    // Check if all lessons completed
    const completedLessons = lessonProgress.length;
    const allLessonsCompleted = completedLessons >= totalSubtopics;

    // Check quiz scores - need at least 50% on each quiz
    let allQuizzesPassed = true;
    let minScore = 100;

    if (quizAttempts.length === 0) {
      allQuizzesPassed = false;
      minScore = 0;
    } else {
      for (const attempt of quizAttempts) {
        if (attempt.score < 50) {
          allQuizzesPassed = false;
        }
        minScore = Math.min(minScore, attempt.score);
      }
    }

    const isEligible = allLessonsCompleted && allQuizzesPassed && minScore >= 50;

    // Update or create progress record
    await UserCurriculumProgress.findOneAndUpdate(
      { userId, curriculumId },
      {
        completed: allLessonsCompleted,
        allModulesPassed: allQuizzesPassed,
        minScore,
        eligibleForCertificate: isEligible
      },
      { upsert: true, new: true }
    );
  }

  async getCertificateEligibility(userId: string, curriculumId: string): Promise<CertificateEligibility> {
    // Update progress first
    await this.updateProgressAndCheckEligibility(userId, curriculumId);

    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId });

    if (!progress) {
      return {
        eligible: false,
        hasPaid: false,
        completedAllModules: false,
        allTestsPassed: false,
        minScore: 0,
        requiredMinScore: 50,
        reason: 'No progress found'
      };
    }

    return {
      eligible: progress.eligibleForCertificate,
      hasPaid: progress.certificatePaid,
      completedAllModules: progress.completed,
      allTestsPassed: progress.allModulesPassed,
      minScore: progress.minScore,
      requiredMinScore: 50,
      reason: !progress.eligibleForCertificate ? 'Complete all modules and pass all tests with at least 50%' : undefined
    };
  }

  async recordPayment(userId: string, curriculumId: string, walletAddress: string, paymentTxHash: string): Promise<boolean> {
    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId });
    
    if (!progress || !progress.eligibleForCertificate) {
      return false;
    }

    await UserCurriculumProgress.findOneAndUpdate(
      { userId, curriculumId },
      {
        certificatePaid: true,
        certificatePaymentTxHash: paymentTxHash,
        walletAddress: walletAddress
      }
    );

    return true;
  }

  async generateCertificateMetadata(userId: string, curriculumId: string): Promise<CertificateMetadata | null> {
    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId });
    const curriculum = await CurriculumModel.findById(curriculumId);
    const user = await User.findById(userId);

    if (!progress || !curriculum || !user || !progress.eligibleForCertificate || !progress.certificatePaid) {
      return null;
    }

    const totalModules = curriculum.modules.length;
    const userEmail = (user as any).email;
    const skill = (curriculum as any).skill;

    return {
      name: `SkillPath: ${skill} Certificate`,
      description: `Certificate issued to ${userEmail} for completing ${skill} on SkillPath.`,
      attributes: {
        skill,
        curriculumId,
        userId,
        userDisplayName: userEmail,
        level: (user as any).profile.currentLevel,
        completionDate: new Date().toISOString(),
        minScore: progress.minScore,
        totalModules,
        passedModules: totalModules
      }
    };
  }

  async recordMint(userId: string, curriculumId: string, walletAddress: string, tokenId: string, mintTxHash: string): Promise<boolean> {
    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId });
    
    if (!progress || !progress.eligibleForCertificate || !progress.certificatePaid) {
      return false;
    }

    await UserCurriculumProgress.findOneAndUpdate(
      { userId, curriculumId },
      {
        certificateTokenId: tokenId,
        certificateMintTxHash: mintTxHash,
        certificateIssued: true,
        walletAddress: walletAddress
      }
    );

    return true;
  }
}

export default new CertificateService();