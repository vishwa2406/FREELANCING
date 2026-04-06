const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const conversationController = require('../controllers/chatController'); // Actually using the wrong one initially, updating now

// Wait, I should point to conversationController
const convCtrl = require('../controllers/conversationController');

router.get('/', protect, convCtrl.getConversations);
router.post('/start', protect, convCtrl.startConversation);
router.get('/:conversationId', protect, convCtrl.getConversationById);

module.exports = router;
