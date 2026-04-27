import express from 'express';
import { getUserProfile, updateUserProfile, getUserAnalytics, deleteUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.get('/analytics', protect, getUserAnalytics);

export default router;
