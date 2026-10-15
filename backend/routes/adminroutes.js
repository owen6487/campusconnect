const express = require('express');
const { AuthMiddlerware, Authorize } = require('../middlerware/AuthMiddlerware');
const { getStats, listUsers, setUserStatus, listListings, deleteListing } = require('../controllers/AdminController');
const { getFeedback, getFeedbackStats, updateFeedbackStatus } = require('../controllers/feedbackController');
const campusController = require('../controllers/campusController');
const branchController = require('../controllers/branchController');

const router = express.Router();

router.use(AuthMiddlerware);
router.use(Authorize('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.get('/listings', listListings);
router.delete('/listings/:id', deleteListing);
router.get('/feedback', getFeedback);
router.get('/feedback/stats', getFeedbackStats);
router.patch('/feedback/:id', updateFeedbackStatus);

router.post('/campuses', campusController.AddCampus);
router.post('/campuses/bulk', campusController.bulkAddCampuses);
router.post('/campuses/:campusId/branches', branchController.AddBranch);
router.post('/campuses/:campusId/branches/bulk', branchController.bulkAddBranches);

module.exports = router;
