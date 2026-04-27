import Request from '../models/Request.js';

// @desc    Create new SOS request
// @route   POST /api/emergency/request
export const createSOSRequest = async (req, res) => {
  const { hospitalName, bloodGroup, urgency, contactPhone, location } = req.body;

  try {
    const request = await Request.create({
      seeker: req.user._id,
      hospitalName,
      bloodGroup,
      urgency,
      contactPhone,
      location: location || { type: 'Point', coordinates: [0, 0] }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a donation mission
// @route   PUT /api/emergency/accept/:id
export const acceptMission = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request already handled' });

    request.assignedDonor = req.user._id;
    request.status = 'Accepted';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active requests (for Donor Map)
// @route   GET /api/emergency/active
export const getActiveRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Pending' })
      .populate('seeker', 'name')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
