const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const Activity = require('../models/Activity');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendEmail, templates } = require('../services/email');

// ── Profile ──
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'gender', 'bio', 'availability', 'hourlyRate', 'yearsExperience', 'skills', 'industries'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/profile/availability', protect, authorize('specialist'), async (req, res) => {
  try {
    const { availability } = req.body;
    if (!['available', 'busy', 'unavailable'].includes(availability)) {
      return res.status(400).json({ success: false, error: 'Invalid availability status' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { availability }, { new: true }).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/profile/image', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: `/uploads/${req.file.filename}` },
      { new: true }
    ).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── KYC ──
router.get('/kyc', protect, authorize('specialist'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kyc name email');
    res.status(200).json({ success: true, kyc: user.kyc });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/kyc', protect, authorize('specialist'), upload.fields([
  { name: 'idImageFront', maxCount: 1 },
  { name: 'idImageBack', maxCount: 1 },
  { name: 'selfieWithId', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.kyc.status === 'approved') {
      return res.status(400).json({ success: false, error: 'KYC already approved' });
    }

    const { fullName, dateOfBirth, idType, idNumber } = req.body;
    if (!fullName || !dateOfBirth || !idType || !idNumber) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    user.kyc = {
      status: 'pending',
      fullName,
      dateOfBirth,
      idType,
      idNumber,
      idImageFront: req.files?.idImageFront?.[0] ? `/uploads/${req.files.idImageFront[0].filename}` : user.kyc.idImageFront,
      idImageBack: req.files?.idImageBack?.[0] ? `/uploads/${req.files.idImageBack[0].filename}` : user.kyc.idImageBack,
      selfieWithId: req.files?.selfieWithId?.[0] ? `/uploads/${req.files.selfieWithId[0].filename}` : user.kyc.selfieWithId,
      submittedAt: new Date(),
      rejectionReason: ''
    };
    await user.save();

    Activity.create({ action: 'kyc.submit', entity: 'User', entityId: user._id, performedBy: req.user._id, details: { name: user.name } }).catch(err =>
      console.error(`[${new Date().toISOString()}] KYC activity log failed:`, err.message)
    );

    if (user.email) {
      const tmpl = templates.kycSubmitted(user.name);
      sendEmail(user.email, tmpl.subject, tmpl.html).catch(err => console.error(`[${new Date().toISOString()}] KYC submission email failed for ${user.email}:`, err.message));
    }

    res.status(200).json({ success: true, kyc: user.kyc });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Admin: KYC Management ──
router.get('/kyc/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'specialist', 'kyc.status': 'pending' })
      .select('name email kyc profileImage location phone')
      .sort({ 'kyc.submittedAt': -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/kyc/all', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'specialist' })
      .select('name email kyc profileImage location phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/kyc/:userId/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.kyc.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'KYC is not pending' });
    }

    user.kyc.status = action;
    user.kyc.reviewedAt = new Date();
    if (action === 'rejected') {
      user.kyc.rejectionReason = rejectionReason || '';
    }
    await user.save();

    res.status(200).json({ success: true, user: { id: user._id, name: user.name, kyc: user.kyc } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Messaging ──
router.get('/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user._id })
      .populate('from', 'name email role profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/messages/sent', protect, async (req, res) => {
  try {
    const messages = await Message.find({ from: req.user._id })
      .populate('to', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/messages', protect, authorize('admin'), async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    const message = await Message.create({
      from: req.user._id,
      to,
      subject,
      body
    });

    const populated = await Message.findById(message._id).populate('from', 'name email role');

    Activity.create({ action: 'message.send', entity: 'Message', entityId: message._id, performedBy: req.user._id, details: { to: recipient.name, subject } }).catch(err =>
      console.error(`[${new Date().toISOString()}] Message activity log failed:`, err.message)
    );

    if (recipient.email) {
      const tmpl = templates.messageReceived(recipient.name, req.user.name || 'Admin', subject);
      sendEmail(recipient.email, tmpl.subject, tmpl.html).catch(err => console.error(`[${new Date().toISOString()}] Message email failed for ${recipient.email}:`, err.message));
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/messages/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.user._id },
      { read: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/messages/:id', protect, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [{ from: req.user._id }, { to: req.user._id }]
    });
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/messages/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ to: req.user._id, read: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/data', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const Project = require('../models/Project');
    const Asset = require('../models/Asset');
    const Comment = require('../models/Comment');

    const [projects, assets, messages] = await Promise.all([
      Project.find({ owner: req.user._id }),
      Asset.find({ uploadedBy: req.user._id }),
      Message.find({ $or: [{ from: req.user._id }, { to: req.user._id }] })
    ]);

    res.status(200).json({
      success: true,
      data: {
        profile: user,
        projects,
        assets,
        messages,
        exportedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
