const express = require('express');
const router = express.Router();

const {
  getMentors,
  sendRequest,
  getMyRequests,
  getMentorRequests,
  updateRequest,
  addNote,
  rateSession
} = require('../controllers/mentorController');

const { protect } = require('../middleware/auth');

router.get('/', getMentors);
router.post('/request', protect, sendRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/incoming', protect, getMentorRequests);
router.patch('/request/:id', protect, updateRequest);
router.post('/request/:id/note', protect, addNote);
router.post('/request/:id/rate', protect, rateSession);

module.exports = router;