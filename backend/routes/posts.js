const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .select('-content')
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true })
      .populate('author', 'name');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, excerpt, published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title and content are required' });
    }
    const slug = slugify(title) + '-' + Date.now().toString(36);
    const post = await Post.create({
      title, slug, content, excerpt: excerpt || '',
      author: req.user._id, published: published || false
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
