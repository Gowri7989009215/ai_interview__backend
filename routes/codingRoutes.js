const express = require('express');
const router = express.Router();
const { getCodingProblem, evaluateSolution } = require('../controllers/codingController');
const { protect } = require('../middleware/auth');

router.get('/problem/:level', protect, getCodingProblem);
router.post('/evaluate', protect, evaluateSolution);

module.exports = router;
