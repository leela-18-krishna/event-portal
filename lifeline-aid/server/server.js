import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('LifeLine API Node is Online');
});

// Database Connection
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('LifeLine DB Connected Successfully');
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
      app.listen(PORT, '0.0.0.0', () => console.log(`LifeLine Server Node running on port ${PORT}`));
    }
  })
  .catch((error) => {
    console.error('DB Connection Failed:', error.message);
  });

export default app;
