const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllInterviews, toggleUserStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/interviews', getAllInterviews);
router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
