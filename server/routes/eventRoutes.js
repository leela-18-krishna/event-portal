import express from 'express';
import { getEvents, createEvent, updateEvent, registerForEvent, updateParticipantStatus, deleteEvent, getCart, getPendingApprovals, removeParticipant, addEventReview, getAllReviews, addDiscussionMessage, getEventDiscussions, getNotifications, getLeaderboard, markNotificationsAsRead, verifyCertificate } from '../controllers/eventController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleCheck.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, authorize('Organizer', 'SuperAdmin'), createEvent);

router.get('/cart', protect, getCart);
router.get('/approvals', protect, authorize('Organizer', 'SuperAdmin'), getPendingApprovals);
router.get('/all-reviews', protect, authorize('Organizer', 'SuperAdmin'), getAllReviews);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsAsRead);
router.get('/leaderboard', getLeaderboard);
router.get('/verify/:certId', verifyCertificate);

router.route('/:id')
  .delete(protect, authorize('Organizer', 'SuperAdmin'), deleteEvent)
  .put(protect, authorize('Organizer', 'SuperAdmin'), updateEvent);

router.post('/:id/register', protect, registerForEvent);
router.post('/:id/reviews', protect, addEventReview);
router.route('/:id/discussions')
  .post(protect, addDiscussionMessage)
  .get(protect, getEventDiscussions);

router.put('/:id/status/:userId', protect, authorize('Organizer', 'SuperAdmin'), updateParticipantStatus);
router.delete('/:id/participant/:userId', protect, removeParticipant);

export default router;
