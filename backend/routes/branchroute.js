const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const AuthMiddlerware = require('../middlerware/AuthMiddlerware');
const { Authorize } = require('../middlerware/AuthMiddlerware');

// Route to add a new branch
router.post('/add', AuthMiddlerware, Authorize('admin'), branchController.AddBranch);
router.post('/bulk', AuthMiddlerware, Authorize('admin'), branchController.bulkAddBranches);

// Route to get all branches for a specific campus
router.get('/all/:campusId', branchController.getAllBranches);

module.exports = router;