const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: [100, 'Name cannot exceed 100 characters'] },
  description: { type: String, default: '', maxlength: [500, 'Description cannot exceed 500 characters'] },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN', enum: ['NGN', 'USD'] },
  deliveryDays: { type: Number, required: true, min: 1 },
  revisions: { type: Number, default: 2 },
  features: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

PackageSchema.index({ specialist: 1 });

module.exports = mongoose.model('Package', PackageSchema);
