import User from '../models/User.js';
import Event from '../models/Event.js';
import DeletedUser from '../models/DeletedUser.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
      user.securityQuestion = req.body.securityQuestion || user.securityQuestion;
      user.securityAnswer = req.body.securityAnswer || user.securityAnswer;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePic: updatedUser.profilePic,
        securityQuestion: updatedUser.securityQuestion,
        securityAnswer: updatedUser.securityAnswer,
        role: updatedUser.role,
        token: req.headers.authorization.split(' ')[1] // Return the token back to keep the session alive
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Archive to separate database/collection
      await DeletedUser.create({
        originalId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic,
        securityQuestion: user.securityQuestion,
        securityAnswer: user.securityAnswer
      });

      // Remove from main database
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'Account permanently archived and removed from active users' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user analytics
// @route   GET /api/users/analytics
// @access  Private
export const getUserAnalytics = async (req, res) => {
  try {
    if (req.user.role === 'Participant') {
      const events = await Event.find({ 'participants.user': req.user._id });
      
      let pending = 0, approved = 0, rejected = 0;
      events.forEach(event => {
        const p = event.participants.find(part => part.user.toString() === req.user._id.toString());
        if (p) {
          if (p.status === 'Pending') pending++;
          if (p.status === 'Approved') approved++;
          if (p.status === 'Rejected') rejected++;
        }
      });
      res.json({ role: 'Participant', totalRequested: events.length, pending, approved, rejected });
    } else {
      const events = await Event.find({ organizer: req.user._id });
      let totalParticipants = 0;
      let totalPending = 0;
      events.forEach(event => {
        totalParticipants += event.participants.length;
        totalPending += event.participants.filter(p => p.status === 'Pending').length;
      });
      res.json({ role: req.user.role, totalEventsCreated: events.length, totalParticipants, totalPendingRequests: totalPending });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
