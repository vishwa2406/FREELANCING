const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: 'text' }, // 'text', 'image', 'video', 'file'
    fileName: { type: String, default: '' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    clientGeneratedId: { type: String }
  },
  { timestamps: true }
);

// Auto-delete messages after 60 days (5184000 seconds)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5184000 });

module.exports = mongoose.model('FreelanceMessage', messageSchema);
