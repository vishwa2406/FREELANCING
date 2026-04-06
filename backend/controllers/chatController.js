const FreelanceMessage = require('../models/FreelanceMessage');
const Conversation = require('../models/Conversation');

// GET /api/chat/:conversationId
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const messages = await FreelanceMessage.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    // Mark these messages as read by current user
    await FreelanceMessage.updateMany(
      { 
        conversation: conversationId, 
        receiver: userId, 
        readBy: { $ne: userId } 
      },
      { $addToSet: { readBy: userId } }
    );

    // Reset unread count for the user
    if (conversation.unreadCount.get(userId.toString()) > 0) {
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat/:conversationId
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', orderId, clientGeneratedId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages here' });
    }

    const receiverId = conversation.participants.find(p => p.toString() !== userId.toString());

    let finalFileType = messageType;
    if (req.file) {
      const mime = req.file.mimetype;
      if (mime.startsWith('image/')) finalFileType = 'image';
      else if (mime.startsWith('video/')) finalFileType = 'video';
      else finalFileType = 'file';
    }

    const messageData = {
      conversation: conversationId,
      sender: userId,
      receiver: receiverId,
      content: content || '',
      fileType: finalFileType,
      clientGeneratedId
    };

    if (orderId) {
      messageData.order = orderId;
    }

    if (req.file) {
      try {
        const cloudinary = require('../config/cloudinary');
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'cegp/chat',
          public_id: `chat_${conversationId}_${Date.now()}`
        });
        
        const fs = require('fs');
        fs.unlink(req.file.path, () => {});

        messageData.fileUrl = uploadResult.secure_url;
        messageData.fileName = req.file.originalname;
      } catch (uploadErr) {
        console.error('Chat file upload failed:', uploadErr);
        // Clean up the local file even on error
        const fs = require('fs');
        if (req.file) fs.unlink(req.file.path, () => {});
        throw new Error(`File upload failed: ${uploadErr.message}`);
      }
    }

    const message = await FreelanceMessage.create(messageData);
    const populatedMessage = await FreelanceMessage.findById(message._id).populate('sender', 'name avatar');

    // Update conversation lastMessage and unread counts
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    await conversation.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      // Emit to conversation room (for those in the chat window)
      io.to(conversationId).emit('new_message', populatedMessage);
      
      // Emit to receiver's personal room (for those elsewhere in the app)
      io.to(receiverId.toString()).emit('new_message', populatedMessage);
      
      // Also notify receiver about unread update (for chat list badge update)
      io.to(receiverId.toString()).emit('conversation_update', {
        conversationId,
        lastMessage: populatedMessage,
        unreadCount: currentUnread + 1
      });
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/chat/:conversationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });

    await FreelanceMessage.updateMany(
      { conversation: conversationId, receiver: userId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // Sync read status in real-time
    req.app.get('io').to(conversationId).emit('messages_read', { conversationId, userId });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
