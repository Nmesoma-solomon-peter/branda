const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const { protect, authorize } = require('../middleware/auth');

router.post('/validate', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Code is required' });
    const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Invalid promo code' });
    if (promo.validUntil && promo.validUntil < new Date()) {
      return res.status(400).json({ success: false, error: 'Promo code has expired' });
    }
    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ success: false, error: 'Promo code has been fully used' });
    }
    res.status(200).json({ success: true, discount: promo.discountPercent, code: promo.code });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { code, discountPercent, maxUses, validUntil } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, error: 'Code and discount are required' });
    }
    const promo = await PromoCode.create({
      code, discountPercent, maxUses, validUntil, createdBy: req.user._id
    });
    res.status(201).json({ success: true, promo });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, error: 'Code already exists' });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promo code not found' });
    res.status(200).json({ success: true, promo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
