const express = require('express');
const router = express.Router();
const { submitAnswer, getInterviewAnswers } = require('../controllers/answerController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, submitAnswer);
router.get('/:interviewId', protect, getInterviewAnswers);

module.exports = router;
