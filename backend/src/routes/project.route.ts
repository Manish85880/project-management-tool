import express from 'express';
import { authenticate } from '../middleware/auth';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/project.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
