import User from '../models/User.js';
import Event from '../models/Event.js';
import DeletedUser from '../models/DeletedUser.js';

const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

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

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.email && req.body.email !== user.email && !isGmail(req.body.email)) {
        return res.status(400).json({ message: 'Only @gmail.com addresses are allowed' });
      }

      if (req.body.phone !== undefined && req.body.phone !== '' && !/^[0-9]{10}$/.test(req.body.phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;

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
        role: updatedUser.role,
        token: req.headers.authorization.split(' ')[1]
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]?.message || 'Invalid data';
      return res.status(400).json({ message: firstError });
    }
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await DeletedUser.create({
        originalId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic,
      });

      await User.deleteOne({ _id: user._id });
      res.json({ message: 'Account permanently archived and removed from active users' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
