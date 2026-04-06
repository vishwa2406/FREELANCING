const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  instructor: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags: [{ type: String }],
  category: { type: String, required: true },
  estimatedHours: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  enrolledCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  isFeatured: { type: Boolean, default: false },
  prerequisites: [{ type: String }],
  outcomes: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

courseSchema.index({ tags: 1, level: 1, category: 1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);