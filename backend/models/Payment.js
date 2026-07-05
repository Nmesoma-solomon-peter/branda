const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD']
  },
  method: {
    type: String,
    enum: ['paystack', 'bank_transfer', 'manual'],
    default: 'paystack'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'escrow', 'released'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['full', 'milestone', 'partial'],
    default: 'full'
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    default: null
  },
  promoCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackRef: {
    type: String,
    default: ''
  },
  invoiceNumber: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  refundedAt: { type: Date },
  refundReason: { type: String, default: '' },
  releasedAt: { type: Date },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PaymentSchema.index({ project: 1 });
PaymentSchema.index({ payer: 1 });
PaymentSchema.index({ reference: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
