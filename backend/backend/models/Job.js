const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'remote', 'freelance', 'contract'],
      default: 'full-time'
    },

    description: { type: String, required: true, trim: true },

    requirements: [
      {
        type: String,
        trim: true
      }
    ],

    skills: [
      {
        type: String,
        trim: true
      }
    ],

    salary: { type: String, default: 'Not disclosed', trim: true },
    applyUrl: { type: String, default: '#', trim: true },
    logo: { type: String, default: '', trim: true },

    isActive: { type: Boolean, default: true },
    deadline: { type: Date },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

jobSchema.index({ skills: 1, type: 1, location: 1, isActive: 1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);