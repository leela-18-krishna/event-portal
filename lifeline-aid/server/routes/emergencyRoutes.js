import express from 'express';
import { 
  createSOSRequest, 
  acceptMission, 
  getActiveRequests 
} from '../controllers/emergencyController.js';
import { findOptimalDonors } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly accessible for the "Match Engine" demo, but usually protected
router.post('/match', findOptimalDonors);

// Protected routes
router.get('/active', protect, getActiveRequests);
router.post('/request', protect, createSOSRequest);
router.put('/accept/:id', protect, acceptMission);

export default router;
