const express = require('express');
const router = express.Router();
const Milestone = require('../models/Milestone');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const milestones = await Milestone.find({ project: req.params.projectId }).sort({ order: 1 });
    res.status(200).json({ success: true, milestones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { projectId, title, description, amount, dueDate, order } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ success: false, error: 'Project ID and title are required' });
    }
    const milestone = await Milestone.create({
      project: projectId, title, description, amount, dueDate, order
    });
    res.status(201).json({ success: true, milestone });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ success: false, error: 'Milestone not found' });
    Object.assign(milestone, req.body);
    if (req.body.status === 'completed') milestone.completedAt = new Date();
    await milestone.save();
    res.status(200).json({ success: true, milestone });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Milestone.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Milestone deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
