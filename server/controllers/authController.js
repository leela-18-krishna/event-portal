import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DeletedUser from '../models/DeletedUser.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const securityQuestions = [
  "What is your favorite food?",
  "Who is your favorite hero?",
  "What is your favorite color?",
  "What was your age on your last birthday?",
  "What is your date of birth? (DD/MM/YYYY)",
  "What is your secondary phone number?",
  "What is your favorite place?",
  "What is your favorite animal?"
];

export const getRandomQuestion = (req, res) => {
  const randomIndex = Math.floor(Math.random() * securityQuestions.length);
  res.json({ question: securityQuestions[randomIndex] });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, securityQuestion, securityAnswer } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isDeleted) {
        return res.status(400).json({ message: 'This account has been deleted and the email is blacklisted.' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if account was archived in the separate collection
    const wasArchived = await DeletedUser.findOne({ email });
    if (wasArchived) {
      return res.status(400).json({ message: 'This account has been permanently deleted and the email is blacklisted.' });
    }

    // Check if an admin already exists
    if (role === 'Admin') {
      const adminExists = await User.findOne({ role: 'Admin' });
      if (adminExists) {
        return res.status(400).json({ message: 'An Admin account already exists. Only one Admin is allowed.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Participant',
      securityQuestion,
      securityAnswer,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        securityQuestion: user.securityQuestion,
        securityAnswer: user.securityAnswer,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        securityQuestion: user.securityQuestion,
        securityAnswer: user.securityAnswer,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear device session
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (user) {
      user.deviceCount = Math.max(0, (user.deviceCount || 1) - 1);
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Fallback for existing users who don't have a question set yet
    if (!user.securityQuestion) {
      user.securityQuestion = "What is your favorite food?";
      user.securityAnswer = "pizza";
      await user.save();
    }
    
    res.json({ question: user.securityQuestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    // Check if new password is same as old password
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
