const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  scope: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  terms: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'pending', 'active', 'completed', 'terminated'], default: 'draft' },
  clientSigned: { type: Boolean, default: false },
  specialistSigned: { type: Boolean, default: false },
  clientSignedAt: { type: Date },
  specialistSignedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);
