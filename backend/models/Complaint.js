const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: [
      'Consumer', 'Labor', 'Property', 'Criminal', 'Family',
      'Cyber', 'Traffic', 'Environmental', 'Government',
      'Healthcare', 'Education', 'Financial', 'Other'
    ],
    default: 'Other'
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  aiAnalysis: {
    category: { type: String, default: '' },
    sentiment: { type: String, default: '' },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', ''],
      default: ''
    },
    confidenceScore: { type: Number, default: 0 },
    isReasonable: { type: Boolean, default: null },
    validityExplanation: { type: String, default: '' },
    suggestedActions: [{ type: String }],
    relevantLaws: [{
      name: { type: String },
      section: { type: String },
      description: { type: String }
    }],
    formalLetter: { type: String, default: '' },
    suggestedAuthority: { type: String, default: '' }
  },
  attachments: [{ type: String }],
  adminNotes: { type: String, default: '' }
}, {
  timestamps: true
});

// Index for search
complaintSchema.index({ title: 'text', description: 'text' });
complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
