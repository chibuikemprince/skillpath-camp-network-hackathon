import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getTopicResources, getModuleProjects, markResourceCompleted, markProjectCompleted, getPortfolio } from '../controllers/resourceController';

const router = Router();

router.use(authenticateToken);

router.get('/topics/:topicId/:curriculumId', getTopicResources);
router.get('/modules/:moduleId/:curriculumId/projects', getModuleProjects);
router.post('/:resourceId/complete', markResourceCompleted);
router.post('/projects/:projectId/complete', markProjectCompleted);
router.get('/portfolio', getPortfolio);

export default router;