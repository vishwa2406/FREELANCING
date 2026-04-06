const mongoose = require('mongoose');

const financeTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    tag: { type: String, default: 'general', trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.FinanceTip || mongoose.model('FinanceTip', financeTipSchema);
