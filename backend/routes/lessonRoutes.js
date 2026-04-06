const express = require('express');
const router = express.Router();
const { getLessons, getLesson, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

router.get('/course/:courseId', protect, getLessons);
router.get('/:id', protect, getLesson);
router.post('/course/:courseId', protect, isAdmin, createLesson);
router.patch('/:id', protect, isAdmin, updateLesson);
router.delete('/:id', protect, isAdmin, deleteLesson);

module.exports = router;