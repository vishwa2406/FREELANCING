const express = require('express');
const router = express.Router();
const {
  getProgress,
  startCourse,
  markLesson,
  getCertificate,
  getMyStats
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.get('/stats', protect, getMyStats);
router.get('/certificate/:courseId', protect, getCertificate);
router.post('/start', protect, startCourse);
router.post('/mark', protect, markLesson);

module.exports = router;