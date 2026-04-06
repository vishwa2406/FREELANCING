const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'chat'));
  },
  filename: (req, file, cb) => {
    cb(null, `chat_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Routes
router.get('/:conversationId', protect, chatController.getMessages);
router.post('/:conversationId', protect, upload.single('file'), chatController.sendMessage);
router.patch('/:conversationId/read', protect, chatController.markAsRead);

module.exports = router;
