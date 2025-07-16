import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  const password = await bcrypt.hash('Test@123', 10);
  const user = await new User({ email: 'test@example.com', password }).save();

  for (let i = 0; i < 2; i++) {
    const project = await new Project({
      userId: user._id,
      title: `Project ${i + 1}`,
      description: `Description for project ${i + 1}`,
    }).save();

    for (let j = 0; j < 3; j++) {
      await new Task({
        projectId: project._id,
        title: `Task ${j + 1} for Project ${i + 1}`,
        description: `Description of task ${j + 1}`,
        status: 'todo',
      }).save();
    }
  }

  console.log('Seeding completed.');
  process.exit();
}

seed();
