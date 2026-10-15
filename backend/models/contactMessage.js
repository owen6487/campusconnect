const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 80,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  topic: {
    type: String,
    enum: ['general', 'report', 'account', 'other'],
    default: 'general',
  },
  listingLink: {
    type: String,
    trim: true,
    default: '',
    maxlength: 300,
  },
  message: {
    type: String,
    trim: true,
    required: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new',
  },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
