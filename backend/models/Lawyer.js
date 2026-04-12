const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Criminal Law', 'Civil Law', 'Cyber Law', 'Family Law',
      'Consumer Law', 'Labor Law', 'Property Law', 'Environmental Law',
      'Financial Law', 'Constitutional Law', 'Corporate Law',
      'Healthcare Law', 'Education Law', 'Traffic Law', 'General Practice'
    ]
  },
  experience: {
    type: Number, // years
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
  },
  barCouncilId: {
    type: String,
    trim: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Other']
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  consultationFee: {
    type: Number, // in INR
    default: 0
  },
  categories: [{
    type: String,
    enum: [
      'Consumer', 'Labor', 'Property', 'Criminal', 'Family',
      'Cyber', 'Traffic', 'Environmental', 'Government',
      'Healthcare', 'Education', 'Financial', 'Other'
    ]
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 2dsphere index for geospatial queries
lawyerSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
lawyerSchema.index({ categories: 1 });
lawyerSchema.index({ specialization: 1 });

module.exports = mongoose.model('Lawyer', lawyerSchema);
