const Conversation = require('../models/Conversation');
const FreelanceMessage = require('../models/FreelanceMessage');

// GET /api/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/conversations/start
exports.startConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    const currentUserId = req.user._id;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId]
      });
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role');

    res.status(200).json({ success: true, conversation: populatedConversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/conversations/:conversationId
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name avatar role')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
