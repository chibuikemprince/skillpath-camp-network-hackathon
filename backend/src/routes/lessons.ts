import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getLesson, generateLessonForSubtopic, getQuiz, submitQuiz } from '../controllers/lessonController';

const router = Router();

router.use(authenticateToken);

router.get('/:lessonId', getLesson);
router.post('/subtopic/:subtopicId/:curriculumId', generateLessonForSubtopic);
router.get('/:lessonId/quiz', getQuiz);
router.post('/quiz/:quizId/submit', submitQuiz);

export default router;