const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' }, // YouTube embed URL
  content: { type: String, default: '' },  // Rich text / markdown notes
  duration: { type: Number, default: 0 },  // minutes
  order: { type: Number, required: true },
  isPreview: { type: Boolean, default: false },
  resources: [{ title: String, url: String }],
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);