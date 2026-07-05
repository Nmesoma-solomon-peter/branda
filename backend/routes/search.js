const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const FAQ = require('../models/FAQ');
const Portfolio = require('../models/Portfolio');
const { protect, authorize } = require('../middleware/auth');

router.get('/specialists', async (req, res) => {
  try {
    const { q, industry, location } = req.query;
    const filter = { role: 'specialist', 'kyc.status': 'approved' };
    if (location) filter.location = new RegExp(location, 'i');

    let specialists = await User.find(filter)
      .select('name email profileImage location bio createdAt')
      .sort({ createdAt: -1 });

    if (q) {
      const regex = new RegExp(q, 'i');
      specialists = specialists.filter(s =>
        regex.test(s.name) || regex.test(s.location) || regex.test(s.bio)
      );
    }

    if (industry) {
      const portfolioSpecialists = await Portfolio.distinct('specialist', { industry });
      specialists = specialists.filter(s => portfolioSpecialists.includes(s._id.toString()));
    }

    res.status(200).json({ success: true, specialists });
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
