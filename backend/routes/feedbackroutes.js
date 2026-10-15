const express = require('express');
const router = express.Router();
const { protect, authOptional, Authorize } = require('../middlerware/AuthMiddlerware');
const {
    submitFeedback,
    getFeedback,
    getFeedbackStats,
    updateFeedbackStatus,
} = require('../controllers/feedbackController');

router.post('/', authOptional, submitFeedback);
router.get('/', protect, Authorize('admin'), getFeedback);
router.get('/stats', protect, Authorize('admin'), getFeedbackStats);
router.patch('/:id', protect, Authorize('admin'), updateFeedbackStatus);

module.exports = router;