const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const protect = require('../middlerware/AuthMiddlerware');
const { Authorize } = require('../middlerware/AuthMiddlerware');
const usersController = require('../controllers/userController');

// Define routes for user-related operations
// stricter rate limits for auth endpoints to reduce brute-force / abuse
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 6, // limit each IP to 6 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many attempts from this IP, please try again later.' },
});

const passwordResetLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // limit password reset requests
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many password reset requests, please try again later.' },
});

router.post('/signup', authLimiter, usersController.signup);
router.post('/login', authLimiter, usersController.login);
router.post('/logout', usersController.logout);
router.post('/requestpasswordreset', passwordResetLimiter, usersController.requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, usersController.resetPassword);
router.post('/google-login', authLimiter, usersController.googleAuth);
router.get('/me', protect, usersController.me);
router.get('/profile', protect, usersController.getProfile);
router.put('/update-profile', protect, usersController.updateProfile);
router.put('/change-password', protect, usersController.changePassword);
router.delete('/delete', protect, usersController.deleteAccount);
router.get('/all', protect, Authorize('admin'), usersController.getAllUsers);
router.patch('/:userId/deactivate', protect, Authorize('admin'), usersController.deactivateAccount);
router.patch('/:userId/reactivate', protect, Authorize('admin'), usersController.reactivateAccount);
module.exports = router;