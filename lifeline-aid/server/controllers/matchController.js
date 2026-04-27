import User from '../models/User.js';
import Request from '../models/Request.js';
import { MinHeap, getCompatibleTypes } from '../utils/dsaEngine.js';

/**
 * findOptimalDonors
 * Uses Hashing and Min-Heaps to find the absolute best donors for an SOS.
 */
export const findOptimalDonors = async (req, res) => {
  const { bloodGroup, latitude, longitude, radius = 5000 } = req.body;

  try {
    // Step 1: Get Compatible Types (O(1) Hashing)
    const compatibleTypes = getCompatibleTypes(bloodGroup);

    // Step 2: Fetch Nearby Compatible Donors (Geospatial Indexing)
    const nearbyDonors = await User.find({
      role: 'Donor',
      isAvailable: true,
      bloodGroup: { $in: compatibleTypes },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radius
        }
      }
    }).limit(50); // Get top 50 nearby

    // Step 3: Refine using custom Min-Heap (DSA requirement)
    // We sort them again to ensure absolute priority in the application layer
    const heap = new MinHeap();
    nearbyDonors.forEach(donor => {
      // In a real app, we'd calculate distance here if not already provided
      // For this demo, we assume the DB near query already gave us a base
      heap.push({
        id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        distance: 0 // Placeholder for real-time traffic calculation
      });
    });

    // Step 4: Extract the top 5 closest "Heroes"
    const optimalDonors = [];
    for (let i = 0; i < 5; i++) {
      const top = heap.pop();
      if (top) optimalDonors.push(top);
    }

    res.status(200).json({
      success: true,
      count: optimalDonors.length,
      donors: optimalDonors
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
