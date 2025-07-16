import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
