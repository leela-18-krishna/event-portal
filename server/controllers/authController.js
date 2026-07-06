import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import DeletedUser from '../models/DeletedUser.js';
import PasswordReset from '../models/PasswordReset.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length <= 2
    ? local[0] + '*'
    : local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    if (!isGmail(email)) {
      return res.status(400).json({ message: 'Only @gmail.com addresses are allowed' });
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isDeleted) {
        return res.status(400).json({ message: 'This account has been deleted and the email is blacklisted.' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const wasArchived = await DeletedUser.findOne({ email });
    if (wasArchived) {
      return res.status(400).json({ message: 'This account has been permanently deleted and the email is blacklisted.' });
    }

    if (role === 'Admin' || role === 'SuperAdmin') {
      const adminExists = await User.findOne({ role: { $in: ['Admin', 'SuperAdmin'] } });
      if (adminExists) {
        return res.status(400).json({ message: 'An Admin account already exists. Only one Admin is allowed.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'Participant',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]?.message || 'Invalid data';
      return res.status(400).json({ message: firstError });
    }
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
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    await PasswordReset.deleteMany({ email });
    await PasswordReset.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendEmail(
      email,
      'Event Portal Password Reset Code',
      `Your Event Portal password reset code is: ${code}\n\nThis code expires in 15 minutes.`
    );

    res.json({ message: 'Code sent', maskedEmail: maskEmail(email) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const resetDoc = await PasswordReset.findOne({ email, code });
    if (!resetDoc) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    if (resetDoc.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ _id: resetDoc._id });
      return res.status(400).json({ message: 'Code has expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }

    user.password = newPassword;
    await user.save();

    await PasswordReset.deleteOne({ _id: resetDoc._id });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
