const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('specialist'), upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, industry } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const item = await Portfolio.create({
      specialist: req.user._id,
      title,
      description: description || '',
      images,
      industry: industry || ''
    });
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/me', protect, authorize('specialist'), async (req, res) => {
  try {
    const items = await Portfolio.find({ specialist: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:specialistId', async (req, res) => {
  try {
    const items = await Portfolio.find({ specialist: req.params.specialistId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, authorize('specialist'), async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    if (item.specialist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const allowed = ['title', 'description', 'industry'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const updated = await Portfolio.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('specialist'), async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    if (item.specialist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await Portfolio.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/reviews', protect, authorize('sme'), async (req, res) => {
  try {
    const { specialistId, projectId, rating, comment } = req.body;
    if (!specialistId || !projectId || !rating) {
      return res.status(400).json({ success: false, error: 'specialistId, projectId, and rating are required' });
    }
    const existing = await Review.findOne({ reviewer: req.user._id, project: projectId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You already reviewed this project' });
    }
    const review = await Review.create({
      reviewer: req.user._id,
      specialist: specialistId,
      project: projectId,
      rating,
      comment: comment || ''
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/reviews/specialist/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ specialist: req.params.id })
      .populate('reviewer', 'name profileImage')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/reviews/average/:specialistId', async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { specialist: require('mongoose').Types.ObjectId.createFromHexString(req.params.specialistId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.status(200).json({
      success: true,
      average: result[0]?.avgRating || 0,
      count: result[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/reviews/:id/respond', protect, authorize('specialist'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Response text is required' });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.specialist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    review.response = { text, respondedAt: new Date() };
    await review.save();
    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/reviews/:id/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    review.reported = true;
    await review.save();
    const ReviewReport = require('../models/ReviewReport');
    await ReviewReport.create({ review: review._id, reportedBy: req.user._id, reason });
    res.status(200).json({ success: true, message: 'Review reported' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/client-reviews', protect, authorize('specialist'), async (req, res) => {
  try {
    const { clientId, projectId, rating, comment } = req.body;
    if (!clientId || !projectId || !rating) {
      return res.status(400).json({ success: false, error: 'clientId, projectId, and rating are required' });
    }
    const Review = require('../models/Review');
    const existing = await Review.findOne({ reviewer: req.user._id, project: projectId, specialist: clientId });
    if (existing) return res.status(400).json({ success: false, error: 'Already reviewed' });
    const review = await Review.create({
      reviewer: req.user._id, specialist: clientId, project: projectId, rating, comment: comment || ''
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/specialists', async (req, res) => {
  try {
    const { industry, location, minRating, q, sortBy, minPrice, maxPrice, availability } = req.query;
    const filter = { role: 'specialist', suspended: false };
    if (availability) filter.availability = availability;

    let specialists = await User.find(filter)
      .select('name email profileImage location bio kyc availability hourlyRate yearsExperience skills industries')
      .sort({ createdAt: -1 });

    if (q) {
      const regex = new RegExp(q, 'i');
      specialists = specialists.filter(s => regex.test(s.name) || regex.test(s.location) || regex.test(s.bio) || (s.skills && s.skills.some(sk => regex.test(sk))));
    }
    if (industry) {
      specialists = specialists.filter(s => s.industries && s.industries.includes(industry));
    }
    if (minPrice) specialists = specialists.filter(s => s.hourlyRate >= Number(minPrice));
    if (maxPrice) specialists = specialists.filter(s => s.hourlyRate <= Number(maxPrice));

    const specialistIds = specialists.map(s => s._id);
    const reviewStats = await Review.aggregate([
      { $match: { specialist: { $in: specialistIds } } },
      { $group: { _id: '$specialist', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const statsMap = {};
    reviewStats.forEach(r => { statsMap[r._id.toString()] = { avgRating: r.avgRating, count: r.count }; });

    specialists = specialists.map(s => ({
      ...s.toObject(),
      averageRating: statsMap[s._id.toString()]?.avgRating || 0,
      reviewCount: statsMap[s._id.toString()]?.count || 0
    }));

    if (sortBy === 'rating') specialists.sort((a, b) => b.averageRating - a.averageRating);
    else if (sortBy === 'price_low') specialists.sort((a, b) => a.hourlyRate - b.hourlyRate);
    else if (sortBy === 'price_high') specialists.sort((a, b) => b.hourlyRate - a.hourlyRate);
    else if (sortBy === 'experience') specialists.sort((a, b) => b.yearsExperience - a.yearsExperience);
    else if (sortBy === 'reviews') specialists.sort((a, b) => b.reviewCount - a.reviewCount);

    res.status(200).json({ success: true, specialists });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/specialist/:id', async (req, res) => {
  try {
    const specialist = await User.findById(req.params.id)
      .select('name email profileImage location bio kyc createdAt skills industries hourlyRate yearsExperience availability gender phone');
    if (!specialist || specialist.role !== 'specialist') {
      return res.status(404).json({ success: false, error: 'Specialist not found' });
    }
    const [items, reviewStats] = await Promise.all([
      Portfolio.find({ specialist: specialist._id }).sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { specialist: specialist._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
    ]);
    res.status(200).json({
      success: true,
      specialist,
      items,
      averageRating: reviewStats[0]?.avgRating || 0,
      reviewCount: reviewStats[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
