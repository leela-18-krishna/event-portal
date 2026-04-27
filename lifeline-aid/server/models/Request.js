import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  seeker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  hospitalName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  urgency: { 
    type: String, 
    enum: ['Critical', 'Urgent', 'Planned'], 
    default: 'Urgent' 
  },
  contactPhone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'En-Route', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  
  // The donor who accepts the mission
  assignedDonor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Location of the emergency (Hospital)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
