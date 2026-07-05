const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
  try {
    const packages = await Package.find({ specialist: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/specialist/:specialistId', async (req, res) => {
  try {
    const packages = await Package.find({ specialist: req.params.specialistId, active: true }).sort({ price: 1 });
    res.status(200).json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('specialist'), async (req, res) => {
  try {
    const { name, description, price, currency, deliveryDays, revisions, features } = req.body;
    if (!name || !price || !deliveryDays) {
      return res.status(400).json({ success: false, error: 'Name, price, and delivery days are required' });
    }
    const pkg = await Package.create({
      specialist: req.user._id,
      name, description, price, currency, deliveryDays, revisions, features
    });
    res.status(201).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('specialist'), async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, specialist: req.user._id });
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    Object.assign(pkg, req.body);
    await pkg.save();
    res.status(200).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('specialist'), async (req, res) => {
  try {
    const pkg = await Package.findOneAndDelete({ _id: req.params.id, specialist: req.user._id });
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.status(200).json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
