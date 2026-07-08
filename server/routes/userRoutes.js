import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserAnalytics,
  deleteUserProfile,
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleCheck.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.get('/analytics', protect, getUserAnalytics);

router.get('/admin-requests', protect, authorize('SuperAdmin'), getAdminRequests);
router.put('/admin-requests/:id/approve', protect, authorize('SuperAdmin'), approveAdminRequest);
router.put('/admin-requests/:id/reject', protect, authorize('SuperAdmin'), rejectAdminRequest);

export default router;
