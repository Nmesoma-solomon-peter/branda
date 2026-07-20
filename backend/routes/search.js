const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const FAQ = require('../models/FAQ');
const Portfolio = require('../models/Portfolio');
const { protect, authorize } = require('../middleware/auth');

router.get('/specialists', async (req, res) => {
  try {
    const { q, category, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let matchFilter = { role: 'specialist', 'kyc.status': 'approved' };
    if (location) matchFilter.location = new RegExp(location, 'i');

    let idFilter = null;

    if (q) {
      const regex = new RegExp(q, 'i');
      matchFilter.$or = [
        { name: regex },
        { location: regex },
        { bio: regex }
      ];
    }

    if (category && category !== 'All') {
      const portfolioSpecialists = await Portfolio.distinct('specialist', { category });
      if (matchFilter._id) {
        matchFilter._id = { $in: portfolioSpecialists };
      } else {
        matchFilter._id = { $in: portfolioSpecialists };
      }
    }

    const [specialists, total] = await Promise.all([
      User.find(matchFilter)
        .select('name email profileImage location bio createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(matchFilter)
    ]);

    const specialistIds = specialists.map(s => s._id);
    const ratings = await Review.aggregate([
      { $match: { specialist: { $in: specialistIds } } },
      { $group: { _id: '$specialist', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r._id.toString()] = {
        averageRating: Math.round(r.averageRating * 10) / 10,
        reviewCount: r.reviewCount
      };
    });

    const result = specialists.map(s => ({
      ...s,
      averageRating: ratingMap[s._id.toString()]?.averageRating || 0,
      reviewCount: ratingMap[s._id.toString()]?.reviewCount || 0
    }));

    res.status(200).json({ success: true, specialists: result, total });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/projects', protect, authorize('admin'), async (req, res) => {
  try {
    const { q, status, industry } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (q) filter.title = new RegExp(q, 'i');

    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('assignedSpecialist', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { q, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
