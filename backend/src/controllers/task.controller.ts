import { Request, Response } from "express";
import Task from "../models/Task";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { logger } from "../utils/logger";

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const {
    projectId,
    status,
    search = "",
    page = "1",
    limit = "10",
  } = req.query;

  if (!projectId) {
    logger.error("Task Controller: getTasks: Missing projectId in query");
    throw new AppError("Project ID is required", 400);
  }

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = { projectId };

  if (status) filter.status = status;
  if (search) {
    filter.title = { $regex: search, $options: "i" }; // case-insensitive search
  }

  logger.info(
    `Task Controller: getTasks: Fetching tasks for projectId=${projectId}, status=${status}, search=${search}`
  );

  const [tasks, total] = await Promise.all([
    Task.find(filter).skip(skip).limit(limitNumber).sort({ dueDate: 1 }),
    Task.countDocuments(filter),
  ]);

  if (!tasks.length) {
    logger.warn(
      `Task Controller: getTasks: No tasks found for projectId=${projectId}`
    );
    throw new AppError("No tasks found", 404);
  }

  res.status(200).json({
    total,
    page: pageNumber,
    pageSize: tasks.length,
    tasks,
  });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { title, status, projectId } = req.body;

  if (!title || !status || !projectId) {
    logger.warn("Task Controller: createTask: Missing required fields");
    throw new AppError("Title, status, and projectId are required", 400);
  }

  const task = new Task(req.body);
  await task.save();

  logger.info(`Task Controller: createTask: Task created with ID ${task._id}`);

  res.status(201).json(task);
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!task) {
    logger.warn(
      `Task Controller: updateTask: Task not found with ID ${req.params.id}`
    );
    throw new AppError("Task not found", 404);
  }

  logger.info(`Task Controller: updateTask: Task updated with ID ${task._id}`);

  res.status(200).json(task);
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const result = await Task.findByIdAndDelete(req.params.id);

  if (!result) {
    logger.warn(
      `Task Controller: deleteTask: Task not found with ID ${req.params.id}`
    );
    throw new AppError("Task not found or already deleted", 404);
  }

  logger.info(
    `Task Controller: deleteTask: Task deleted with ID ${req.params.id}`
  );

  res.status(204).send();
});
