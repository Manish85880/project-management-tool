import User from "../models/User";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn(
      "Auth Controller: register : Registration failed - Missing email or password"
    );
    throw new AppError("Please provide email and password", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.warn(
      `Auth Controller: register : Registration failed - Email already registered - ${email}`
    );
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  logger.info(
    `Auth Controller: register : User registered successfully: userId = ${user._id}`
  );

  res.status(201).json({ message: "User registered successfully" });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn(
      "Auth Controller: login: Login failed: Missing email or password"
    );
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(
      `Auth Controller: login: Login failed: User not found with email: ${email}`
    );
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(
      `Auth Controller: login: Login failed: Incorrect password for email: ${email}`
    );
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  logger.info(
    `Auth Controller: login: Login successful for user ID: ${user._id}`
  );

  res.status(200).json({ token });
});
