import Event from '../models/Event.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name email phone')
      .populate('participants.user', 'name email phone');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Organizer or SuperAdmin
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, venue, prizeMoneyPool, category, subEvents, contactPhone, contactEmail } = req.body;

    const event = new Event({
      title,
      description,
      date,
      endDate,
      venue,
      prizeMoneyPool,
      contactPhone,
      contactEmail,
      category,
      subEvents: subEvents || [],
      organizer: req.user._id,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a participant for an event
// @route   POST /api/events/:id/register
// @access  Private/Participant
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      const existingParticipant = event.participants.find(p => p.user.toString() === req.user._id.toString());
      if (existingParticipant) {
        return res.status(400).json({ message: `Already requested. Status: ${existingParticipant.status}` });
      }

      const { subEventTitle, subSubEventTitle } = req.body;

      event.participants.push({ 
        user: req.user._id, 
        status: 'Pending',
        subEventTitle: subEventTitle || '',
        subSubEventTitle: subSubEventTitle || ''
      });
      await event.save();

      if (!req.user.interestedEvents.includes(event._id)) {
        req.user.interestedEvents.push(event._id);
        await req.user.save();
      }

      res.status(200).json({ message: 'Successfully requested to participate' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a participant status (Approve/Reject)
// @route   PUT /api/events/:id/status/:userId
// @access  Private/Organizer or SuperAdmin
export const updateParticipantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized to update status for this event' });
    }

    const participant = event.participants.find(p => p.user.toString() === req.params.userId);
    if (!participant) return res.status(404).json({ message: 'Participant not found in this event' });

    participant.status = status;

    // Generate Certificate ID if approved
    if (status === 'Approved' && !participant.certificateId) {
      const year = new Date().getFullYear();
      const userPart = req.params.userId.slice(-4).toUpperCase();
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      participant.certificateId = `EP-${year}-${userPart}-${randomStr}`;
    }

    await event.save();

    // Notify user
    await Notification.create({
      user: req.params.userId,
      title: `Event Registration ${status}`,
      message: `Your registration for ${event.title} has been ${status.toLowerCase()}.`,
      type: 'Approval',
      link: '/registrations'
    });

    // Award points if approved
    if (status === 'Approved') {
      const user = await User.findById(req.params.userId);
      if (user) {
        user.points = (user.points || 0) + 50;
        await user.save();
      }
    }

    res.json({ message: `Participant ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Organizer or SuperAdmin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Organizer or SuperAdmin
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, endDate, venue, prizeMoneyPool, category, subEvents, contactPhone, contactEmail } = req.body;
    
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.endDate = endDate || event.endDate;
    event.venue = venue || event.venue;
    event.prizeMoneyPool = prizeMoneyPool !== undefined ? prizeMoneyPool : event.prizeMoneyPool;
    event.contactPhone = contactPhone !== undefined ? contactPhone : event.contactPhone;
    event.contactEmail = contactEmail !== undefined ? contactEmail : event.contactEmail;
    event.category = category || event.category;
    if (subEvents !== undefined) {
      event.subEvents = subEvents;
      event.markModified('subEvents');
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's requested events (History/Cart)
// @route   GET /api/events/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const events = await Event.find({
      'participants': { $elemMatch: { user: req.user._id } }
    }).populate('organizer', 'name email phone');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organizer's pending approvals
// @route   GET /api/events/approvals
// @access  Private/Organizer or SuperAdmin
export const getPendingApprovals = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).populate('participants.user', 'name email phone');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a participant (Withdraw or Admin Kick)
// @route   DELETE /api/events/:id/participant/:userId
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Determine authorization: User removing themselves OR Admin/Organizer removing someone
    const isSelf = req.user._id.toString() === req.params.userId;
    const isOrganizer = event.organizer.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'SuperAdmin';

    if (!isSelf && !isOrganizer && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to remove this participant' });
    }

    // Remove participant from event
    event.participants = event.participants.filter(p => p.user.toString() !== req.params.userId);
    await event.save();

    res.json({ message: 'Registration history deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a review to an event
// @route   POST /api/events/:id/reviews
// @access  Private/Participant
export const addEventReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if user already reviewed
      const alreadyReviewed = event.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Event already reviewed' });
      }

      const review = {
        user: req.user._id,
        rating: Number(rating),
        comment,
      };

      event.reviews.push(review);
      await event.save();

      // Award points for review
      const user = await User.findById(req.user._id);
      if (user) {
        const pointsAwarded = rating === 5 ? 30 : 10;
        user.points = (user.points || 0) + pointsAwarded;
        await user.save();
      }

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (Admin view)
// @route   GET /api/events/all-reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const events = await Event.find({ reviews: { $exists: true, $not: { $size: 0 } } })
      .populate('reviews.user', 'name email profilePic')
      .select('title reviews');
    
    // Flatten reviews for the admin
    let allReviews = [];
    events.forEach(event => {
      event.reviews.forEach(review => {
        allReviews.push({
          eventTitle: event.title,
          ...review._doc
        });
      });
    });

    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a message to event discussion
// @route   POST /api/events/:id/discussions
// @access  Private/Approved Participant
export const addDiscussionMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only approved participants or organizers can chat
    const isApproved = event.participants.some(p => p.user.toString() === req.user._id.toString() && p.status === 'Approved');
    const isOrganizer = event.organizer.toString() === req.user._id.toString() || req.user.role === 'SuperAdmin';

    if (!isApproved && !isOrganizer) {
      return res.status(403).json({ message: 'Only approved participants can discuss' });
    }

    event.discussions.push({
      user: req.user._id,
      message
    });

    await event.save();
    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event discussions
// @route   GET /api/events/:id/discussions
// @access  Private
export const getEventDiscussions = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('discussions.user', 'name profilePic role');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event.discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify certificate by ID
// @route   GET /api/events/verify/:certId
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const event = await Event.findOne({ 'participants.certificateId': req.params.certId.toUpperCase() })
      .populate('participants.user', 'name profilePic');
    
    if (!event) return res.status(404).json({ message: 'Certificate not found or invalid ID' });

    const participant = event.participants.find(p => p.certificateId === req.params.certId.toUpperCase());
    
    res.json({
      event: { title: event.title, date: event.date, venue: event.venue },
      user: participant.user,
      certificateId: participant.certificateId,
      issuedAt: participant.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'Participant' })
      .sort({ points: -1 })
      .limit(10)
      .select('name profilePic points');
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
