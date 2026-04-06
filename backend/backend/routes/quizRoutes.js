const express = require('express');
const router = express.Router();
const {
  getQuiz,
  getQuizzesByCourse,
  submitQuiz,
  getUserAttempts,
  createQuiz,
  updateQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuiz);
router.get('/:id/attempts', protect, getUserAttempts);
router.post('/:id/submit', protect, submitQuiz);

router.post('/course/:courseId', protect, isAdmin, createQuiz);
router.patch('/:id', protect, isAdmin, updateQuiz);

module.exports = router;