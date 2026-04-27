import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Donor', 'Hospital', 'Seeker'], 
    default: 'Donor' 
  },
  
  // Specific to Donors
  bloodGroup: { type: String },
  lastDonationDate: { type: Date },
  isAvailable: { type: Boolean, default: true },
  trustScore: { type: Number, default: 0 },
  
  // Specific to Hospitals
  licenseId: { type: String },
  isVerified: { type: Boolean, default: false },
  
  // Location for DSA Matching
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
