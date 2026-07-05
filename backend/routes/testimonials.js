const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, role, company, text, rating } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text is required' });
    const testimonial = await Testimonial.create({
      name: name || req.user.name,
      role: role || '',
      company: company || '',
      text,
      rating: rating || 5
    });
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
