const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

router.get('/active', protect, async (req, res) => {
  try {
    const query = { active: true };
    query.$or = [
      { target: 'all' },
      { target: req.user.role }
    ];
    const now = new Date();
    query.$and = [
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] }
    ];

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title message type createdAt');

    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message, type, target, expiresAt } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      target: target || 'all',
      expiresAt: expiresAt || null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message, type, target, active, expiresAt } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, type, target, active, expiresAt },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.status(200).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/feedback', protect, async (req, res) => {
  try {
    const { type, message, page } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    await Feedback.create({
      user: req.user._id,
      type: type || 'general',
      message,
      page: page || ''
    });

    res.status(201).json({ success: true, message: 'Feedback submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/feedback', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/feedback/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
