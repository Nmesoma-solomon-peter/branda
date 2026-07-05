const express = require('express');
const router = express.Router();
const ReviewReport = require('../models/ReviewReport');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { reviewId, reason } = req.body;
    if (!reviewId || !reason) {
      return res.status(400).json({ success: false, error: 'Review ID and reason are required' });
    }
    const existing = await ReviewReport.findOne({ review: reviewId, reportedBy: req.user._id });
    if (existing) return res.status(400).json({ success: false, error: 'You already reported this review' });
    const report = await ReviewReport.create({ review: reviewId, reportedBy: req.user._id, reason });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const reports = await ReviewReport.find()
      .populate('review')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const report = await ReviewReport.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    }, { new: true });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
