const express = require('express');
const router = express.Router();
const { startInterview, getInterview, getUserInterviews, getInterviewQuestions, completeInterview, flagAntiCheat } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startInterview);
router.get('/', protect, getUserInterviews);
router.get('/:id', protect, getInterview);
router.get('/:id/questions', protect, getInterviewQuestions);
router.put('/:id/complete', protect, completeInterview);
router.post('/:id/flag', protect, flagAntiCheat);

module.exports = router;
