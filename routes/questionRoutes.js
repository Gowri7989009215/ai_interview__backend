const express = require('express');
const router = express.Router();
const { getNextQuestion, getInterviewQuestions } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.post('/next', protect, getNextQuestion);
router.get('/:interviewId', protect, getInterviewQuestions);

module.exports = router;
