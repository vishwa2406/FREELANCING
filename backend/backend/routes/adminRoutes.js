const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  updateUser,
  getMentorRequestsForAdmin
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

router.use(protect, isAdmin);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/mentor-requests', getMentorRequestsForAdmin);

module.exports = router;