const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ specialist: req.user._id }).sort({ createdAt: -1 });
    const totalEarnings = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawn = await Withdrawal.aggregate([
      { $match: { specialist: req.user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.status(200).json({
      success: true,
      withdrawals,
      earnings: {
        total: totalEarnings[0]?.total || 0,
        withdrawn: totalWithdrawn[0]?.total || 0,
        available: (totalEarnings[0]?.total || 0) - (totalWithdrawn[0]?.total || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('specialist'), async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;
    if (!amount || !bankName || !accountNumber || !accountName) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const withdrawal = await Withdrawal.create({
      specialist: req.user._id, amount, bankName, accountNumber, accountName
    });
    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('specialist', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason, processedBy: req.user._id, processedAt: new Date() },
      { new: true }
    );
    if (!withdrawal) return res.status(404).json({ success: false, error: 'Withdrawal not found' });
    res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
