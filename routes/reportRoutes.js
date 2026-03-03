const express = require('express');
const router = express.Router();
const { generateReport, getReport, getUserReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// IMPORTANT: /my must come before /:id to avoid 'my' being matched as an id
router.get('/my', protect, getUserReports);
router.post('/generate/:id', protect, generateReport);
router.get('/:id', protect, getReport);

module.exports = router;
