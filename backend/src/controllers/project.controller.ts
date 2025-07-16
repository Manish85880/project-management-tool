// File: src/controllers/project.controller.ts

import { Request, Response } from 'express';
import Project from '../models/Project';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  userId?: string;
}

export const getProjects = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    logger.error('Project Controller: getProjects: Missing userId in request');
    throw new AppError('Unauthorized access', 401);
  }

  const { page = '1', limit = '10', search = '' } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  logger.info(
    `Project Controller: getProjects: userId=${userId}, page=${pageNumber}, limit=${limitNumber}, search='${search}'`
  );

  const query: any = { userId };
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const [projects, total] = await Promise.all([
    Project.find(query).skip(skip).limit(limitNumber).sort({ createdAt: -1 }),
    Project.countDocuments(query),
  ]);

  if (!projects.length) {
    logger.warn(`Project Controller: getProjects: No projects found for userId=${userId}`);
    throw new AppError('No projects found', 404);
  }

  logger.info(`Project Controller: getProjects: Retrieved ${projects.length} projects for userId=${userId}`);

  res.status(200).json({
    total,
    page: pageNumber,
    pageSize: projects.length,
    projects,
  });
});

export const createProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    logger.error('Project Controller: createProject: Missing userId');
    throw new AppError('Unauthorized access', 401);
  }

  const { title, description, status } = req.body;

  if (!title || !status) {
    logger.warn('Project Controller: createProject: Missing required fields');
    throw new AppError('Title and status are required', 400);
  }

  const project = new Project({ title, description, status, userId });
  await project.save();

  logger.info(`Project Controller: createProject: Project created with ID ${project._id}`);

  res.status(201).json(project);
});

export const updateProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    logger.error('Project Controller: updateProject: Missing userId');
    throw new AppError('Unauthorized access', 401);
  }

  const updated = await Project.findOneAndUpdate(
    { _id: req.params.id, userId },
    req.body,
    { new: true }
  );

  if (!updated) {
    logger.warn(`Project Controller: updateProject: Project not found with ID ${req.params.id}`);
    throw new AppError('Project not found', 404);
  }

  logger.info(`Project Controller: updateProject: Project updated with ID ${updated._id}`);

  res.status(200).json(updated);
});

export const deleteProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    logger.error('Project Controller: deleteProject: Missing userId');
    throw new AppError('Unauthorized access', 401);
  }

  const result = await Project.deleteOne({ _id: req.params.id, userId });

  if (result.deletedCount === 0) {
    logger.warn(`Project Controller: deleteProject: No project deleted with ID ${req.params.id}`);
    throw new AppError('Project not found or already deleted', 404);
  }

  logger.info(`Project Controller: deleteProject: Project deleted with ID ${req.params.id}`);

  res.status(204).send(); // No content
});

