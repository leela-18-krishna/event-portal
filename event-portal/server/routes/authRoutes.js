import express from 'express';
import { registerUser, authUser, getRandomQuestion, forgotPassword, resetPassword, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.get('/random-question', getRandomQuestion);
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
