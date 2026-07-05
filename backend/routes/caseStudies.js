const express = require('express');
const router = express.Router();
const CaseStudy = require('../models/CaseStudy');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, caseStudies });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug, published: true });
    if (!caseStudy) return res.status(404).json({ success: false, error: 'Case study not found' });
    res.status(200).json({ success: true, caseStudy });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const cs = await CaseStudy.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, caseStudy: cs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cs = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cs) return res.status(404).json({ success: false, error: 'Case study not found' });
    res.status(200).json({ success: true, caseStudy: cs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Case study deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
