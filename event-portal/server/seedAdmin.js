import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventportal';
    await mongoose.connect(MONGO_URI);

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@eventportal.io' });
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create SuperAdmin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@eventportal.io',
      password: 'admin123',
      role: 'SuperAdmin'
    });

    await admin.save();
    console.log('SuperAdmin user seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
