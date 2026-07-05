const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Subject and message are required' });
    }
    const ticket = await Ticket.create({
      user: req.user._id, subject, message, category, priority
    });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('replies.author', 'name role');
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    ticket.replies.push({ author: req.user._id, message });
    if (req.user.role === 'admin' && ticket.status === 'open') ticket.status = 'in_progress';
    await ticket.save();
    const populated = await Ticket.findById(ticket._id)
      .populate('user', 'name email')
      .populate('replies.author', 'name role');
    res.status(201).json({ success: true, ticket: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
