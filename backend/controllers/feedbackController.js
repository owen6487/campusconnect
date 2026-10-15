// controllers/feedbackController.js
const mongoose = require('mongoose');
const Feedback = require('../models/feedback');

// The questions — add/edit here, frontend reads from its own copy
const QUESTION_KEYS = ['easy_to_use', 'found_what_they_wanted', 'would_recommend'];

/* POST /api/feedback — public (optional auth attaches user) */
const submitFeedback = async (req, res) => {
    try {
        const { answers = {}, rating, suggestion, bug = {}, email } = req.body;

        // Only accept known question keys
        const cleanAnswers = {};
        for (const key of QUESTION_KEYS) {
            if (answers[key] === 'yes' || answers[key] === 'no') cleanAnswers[key] = answers[key];
        }

        const hasSuggestion = !!suggestion?.trim();
        const hasBug = !!bug.whatHappened?.trim();
        const answeredCount = Object.keys(cleanAnswers).length;

        if (answeredCount === 0 && !hasSuggestion && !hasBug) {
            return res.status(400).json({ message: 'Please answer at least one question or write something.' });
        }

        await Feedback.create({
            user: req.user?.id || req.user?._id || null,
            email: req.user ? '' : (email || '').trim(),
            answers: cleanAnswers,
            rating: rating >= 1 && rating <= 5 ? rating : null,
            suggestion: suggestion?.trim() || '',
            bug: {
                whatHappened: bug.whatHappened?.trim() || '',
                expected: bug.expected?.trim() || '',
            },
        });

        res.status(201).json({ message: 'Thank you! We read every message.' });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/* GET /api/feedback — admin only */
const getFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const { status, type, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (['new', 'read', 'resolved'].includes(status)) filter.status = status;
        if (type === 'bugs') filter['bug.whatHappened'] = { $ne: '' };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);

        const [items, total] = await Promise.all([
            Feedback.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .populate('user', 'name email'),
            Feedback.countDocuments(filter),
        ]);

        res.status(200).json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/* GET /api/feedback/stats — admin only */
const getFeedbackStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const all = await Feedback.find().select('answers rating status createdAt bug').lean();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        let yes = 0, no = 0, bugCount = 0;
        const ratings = [];
        const byStatus = { new: 0, read: 0, resolved: 0 };

        for (const f of all) {
            for (const v of Object.values(f.answers || {})) {
                if (v === 'yes') yes++;
                if (v === 'no') no++;
            }
            if (f.rating) ratings.push(f.rating);
            if (f.bug?.whatHappened) bugCount++;
            byStatus[f.status] = (byStatus[f.status] || 0) + 1;
        }

        const answered = yes + no;
        res.status(200).json({
            total: all.length,
            thisWeek: all.filter((f) => new Date(f.createdAt) >= weekAgo).length,
            avgRating: ratings.length
                ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : null,
            yesPercent: answered ? Math.round((yes / answered) * 100) : null,
            bugs: bugCount,
            byStatus,
        });
    } catch (error) {
        console.error('Feedback stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/* PATCH /api/feedback/:id — admin only, change status */
const updateFeedbackStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const { status } = req.body;
        if (!['new', 'read', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const item = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!item) return res.status(404).json({ message: 'Feedback not found' });

        res.status(200).json(item);
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { submitFeedback, getFeedback, getFeedbackStats, updateFeedbackStatus };