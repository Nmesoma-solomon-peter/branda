const express = require('express');
const router = express.Router();
const Annotation = require('../models/Annotation');
const Asset = require('../models/Asset');
const { protect } = require('../middleware/auth');

router.get('/asset/:assetId', protect, async (req, res) => {
  try {
    const annotations = await Annotation.find({ asset: req.params.assetId })
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, annotations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const annotations = await Annotation.find({ project: req.params.projectId })
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, annotations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { assetId, projectId, x, y, text } = req.body;
    if (!assetId || !projectId || x == null || y == null || !text) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const annotation = await Annotation.create({
      asset: assetId,
      project: projectId,
      author: req.user._id,
      x, y, text
    });

    const populated = await Annotation.findById(annotation._id)
      .populate('author', 'name role profileImage');

    res.status(201).json({ success: true, annotation: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Reply text is required' });
    }

    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ success: false, error: 'Annotation not found' });
    }

    annotation.replies.push({ author: req.user._id, text });
    await annotation.save();

    const populated = await Annotation.findById(annotation._id)
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage');

    res.status(201).json({ success: true, annotation: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ success: false, error: 'Annotation not found' });
    }

    annotation.resolved = !annotation.resolved;
    await annotation.save();

    res.status(200).json({ success: true, annotation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ success: false, error: 'Annotation not found' });
    }
    if (annotation.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Annotation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Annotation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
