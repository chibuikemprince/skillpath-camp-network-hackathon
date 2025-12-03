import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createCurriculum, getCurriculum, getWeeklyPlan, getProgressDashboard, completeWeek, getWeekStatus } from '../controllers/curriculumController';

const router = Router();

router.use(authenticateToken);

router.post('/', createCurriculum);
router.get('/', getCurriculum);
router.get('/week/:week', getWeeklyPlan);
router.get('/dashboard', getProgressDashboard);
router.post('/week/:week/complete', completeWeek);
router.get('/week/:week/status', getWeekStatus);

export default router;