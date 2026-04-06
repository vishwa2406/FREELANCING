const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  updateUser,
  getMentors,
  getMentorRequestsForAdmin,
  getFinanceOverview,
  addFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
  getChatAnalytics,
  getChatHistory
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

router.use(protect, isAdmin);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/mentors', getMentors);
router.get('/mentor-requests', getMentorRequestsForAdmin);
router.get('/finance-overview', getFinanceOverview);
router.post('/finance/tx', addFinanceTransaction);
router.patch('/finance/tx/:id', updateFinanceTransaction);
router.delete('/finance/tx/:id', deleteFinanceTransaction);

// Chat Monitoring
router.get('/chat/analytics', getChatAnalytics);
router.get('/chat/:conversationId', getChatHistory);

module.exports = router;