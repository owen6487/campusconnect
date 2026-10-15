// models/feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,                 // guests can submit too
    },
    email: { type: String, trim: true, default: '' },  // only from guests
    answers: {
        type: Map,
        of: String,                    // question key → 'yes' | 'no'
        default: {},
    },
    rating: { type: Number, min: 1, max: 5, default: null },
    suggestion: { type: String, trim: true, maxlength: 2000, default: '' },
    bug: {
        whatHappened: { type: String, trim: true, maxlength: 2000, default: '' },
        expected: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);