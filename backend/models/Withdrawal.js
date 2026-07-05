const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'NGN' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountName: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

WithdrawalSchema.index({ specialist: 1 });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
