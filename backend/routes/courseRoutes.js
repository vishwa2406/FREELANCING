const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  getRecommended,
  toggleBookmark,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect, optionalProtect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

router.get('/', getCourses);
router.get('/recommended', protect, getRecommended);
router.get('/:id', optionalProtect, getCourse);
router.post('/:id/bookmark', protect, toggleBookmark);

router.post('/', protect, isAdmin, createCourse);
router.patch('/:id', protect, isAdmin, updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);

module.exports = router;