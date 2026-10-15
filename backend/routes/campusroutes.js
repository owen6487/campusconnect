const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');
const AuthMiddlerware = require('../middlerware/AuthMiddlerware');
const { Authorize } = require('../middlerware/AuthMiddlerware');

// Route to add a new campus
router.post('/add', AuthMiddlerware, Authorize('admin'), campusController.AddCampus);
router.post('/add-many', AuthMiddlerware, Authorize('admin'), campusController.bulkAddCampuses);

// Route to get all campuses with branch information
router.get('/all', campusController.getAllcampus);

module.exports = router;

