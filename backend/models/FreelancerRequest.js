const mongoose = require('mongoose');

const freelancerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    portfolio: { type: String, default: '' },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' },
    yearsOfExperience: { type: Number, default: 0 },
    rate: { type: String, default: '' },
    availability: { type: Number, default: 0 },
    timezone: { type: String, default: '' },
    primarySkills: [{ type: String }],
    screeningAnswers: {
      expertise: { type: String, default: '' },
      deadlines: { type: String, default: '' },
      pastProject: { type: String, default: '' }
    },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FreelancerRequest', freelancerRequestSchema);
