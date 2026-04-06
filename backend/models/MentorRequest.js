const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  note: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
});

const mentorRequestSchema = new mongoose.Schema({
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  sessionNotes: [sessionNoteSchema],
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' },
  scheduledAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);