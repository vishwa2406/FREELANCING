const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Project is optional for direct service orders
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },
    // Project field (optional) for direct service orders
    // Already defined above
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Optional service reference for direct hires
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false
    },
    amount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['active', 'delivered', 'completed', 'cancelled'],
      default: 'active'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    invoiceGeneratedAt: { type: Date },
    invoiceExpiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
