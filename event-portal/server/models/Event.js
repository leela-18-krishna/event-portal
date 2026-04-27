import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  venue: {
    type: String,
    required: true,
  },
  prizeMoneyPool: {
    type: Number,
    default: 0,
  },
  contactPhone: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Technology', 'Sports', 'Music', 'Arts', 'Business', 'Other'],
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    subEventTitle: {
      type: String,
    },
    subSubEventTitle: {
      type: String,
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true
    }
  }],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  discussions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  subEvents: [{
    title: { type: String, required: true },
    prizeMoney: { type: Number, default: 0 },
    entryFee: { type: Number, default: 0 },
    subSubEvents: [{
      title: { type: String, required: true },
      prizeMoney: { type: Number, default: 0 },
      entryFee: { type: Number, default: 0 }
    }]
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Event', eventSchema);
