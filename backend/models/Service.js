const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
