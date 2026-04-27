import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('--- CRITICAL CONFIG ERROR ---');
  console.error('MONGO_URI is MISSING in Vercel settings!');
  console.error('Please check Vercel -> Settings -> Environment Variables');
  console.error('-----------------------------');
}

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((error) => {
    console.error('--- CLOUD DB ERROR ---');
    console.error('Error Message:', error.message);
    console.error('URI Provided:', MONGO_URI ? 'YES (Masked)' : 'NO');
    console.error('----------------------');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Event Portal API is running...');
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Start Server (only if not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

export default app;
