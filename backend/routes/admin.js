const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Subscriber = require('../models/Subscriber');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { protect, authorize } = require('../middleware/auth');
const { clearCache } = require('../middleware/maintenance');
const { sendEmail, templates } = require('../services/email');
const { createNotification } = require('../utils/notifications');

const adminOnly = [protect, authorize('admin')];

const logActivity = (action, entity, entityId, performedBy, details = {}) => {
  Activity.create({ action, entity, entityId, performedBy, details }).catch(err =>
    console.error(`[${new Date().toISOString()}] Activity log failed:`, err.message)
  );
};

// ── Stats ──
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [users, projects, assets, subscribers, specialists, smes, activeProjects, completedProjects, pendingKyc] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Asset.countDocuments(),
      Subscriber.countDocuments(),
      User.countDocuments({ role: 'specialist' }),
      User.countDocuments({ role: 'sme' }),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'specialist', 'kyc.status': 'pending' })
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers, recentProjects] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Project.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const signupsByDay = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true, stats: {
        users, projects, assets, subscribers, specialists, smes,
        activeProjects, completedProjects, pendingKyc,
        recentUsers, recentProjects, signupsByDay, projectsByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Settings ──
router.get('/settings', ...adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/settings', ...adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    const allowed = ['platformName', 'platformDescription', 'contactEmail', 'contactPhone', 'contactAddress', 'metaTitle', 'metaDescription', 'metaKeywords', 'ogImage', 'sitemapEnabled', 'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'smtpEnabled', 'footerText', 'maintenanceMode'];
    allowed.forEach(f => { if (req.body[f] !== undefined) settings[f] = req.body[f]; });
    await settings.save();
    clearCache();
    logActivity('settings.update', 'Settings', settings._id, req.user._id, { changes: Object.keys(req.body) });
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Users ──
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    logActivity('user.delete', 'User', user._id, req.user._id, { name: user.name, email: user.email, role: user.role });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/users/:id/role', ...adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['sme', 'specialist', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    logActivity('user.role_change', 'User', user._id, req.user._id, { name: user.name, newRole: role });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Projects ──
router.get('/projects', ...adminOnly, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .populate('assignedSpecialist', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/projects/:id/assign', ...adminOnly, async (req, res) => {
  try {
    const { specialistId, budget, deadline } = req.body;
    const updateData = { assignedSpecialist: specialistId, status: 'active', assignedAt: new Date() };
    if (budget !== undefined) updateData.budget = budget;
    if (deadline) updateData.deadline = deadline;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email').populate('assignedSpecialist', 'name email');
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    logActivity('project.assign', 'Project', project._id, req.user._id, {
      title: project.title, specialist: project.assignedSpecialist?.name
    });

    if (project.assignedSpecialist?.email) {
      const tmpl = templates.projectAssigned(project.assignedSpecialist.name, project.title, project.owner?.name || 'A client');
      sendEmail(project.assignedSpecialist.email, tmpl.subject, tmpl.html).catch(err => console.error(`[${new Date().toISOString()}] Assignment email failed for ${project.assignedSpecialist.email}:`, err.message));
    }

    if (project.assignedSpecialist?._id) {
      createNotification(project.assignedSpecialist._id, 'project_assigned', 'New Project Assigned', `You've been assigned "${project.title}"`, '/specialist-dashboard');
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/projects/:id/status', ...adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'in_review', 'completed', 'revision', 'dispute'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    logActivity('project.status_change', 'Project', project._id, req.user._id, {
      title: project.title, newStatus: status
    });
    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/projects/:id', ...adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    logActivity('project.delete', 'Project', project._id, req.user._id, { title: project.title });
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Assets (admin) ──
router.get('/assets', ...adminOnly, async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate('uploadedBy', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Subscribers ──
router.get('/subscribers', ...adminOnly, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/subscribers/:id', ...adminOnly, async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Subscriber not found' });
    }
    logActivity('subscriber.delete', 'Subscriber', subscriber._id, req.user._id, { email: subscriber.email });
    res.status(200).json({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── KYC Management ──
router.get('/kyc/pending', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'specialist', 'kyc.status': 'pending' })
      .select('name email kyc profileImage location phone')
      .sort({ 'kyc.submittedAt': -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/kyc/all', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'specialist' })
      .select('name email kyc profileImage location phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/kyc/:userId/review', ...adminOnly, async (req, res) => {
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

    logActivity(action === 'approved' ? 'kyc.approve' : 'kyc.reject', 'User', user._id, req.user._id, {
      name: user.name, reason: rejectionReason
    });

    if (user.email) {
      const tmpl = action === 'approved' ? templates.kycApproved(user.name) : templates.kycRejected(user.name, rejectionReason);
      sendEmail(user.email, tmpl.subject, tmpl.html).catch(err => console.error(`[${new Date().toISOString()}] KYC review email failed for ${user.email}:`, err.message));
    }

    res.status(200).json({ success: true, user: { id: user._id, name: user.name, kyc: user.kyc } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── Activity Logs ──
router.get('/activities', ...adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.user) filter.performedBy = req.query.user;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true, activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/activities/:id', ...adminOnly, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/activities', ...adminOnly, async (req, res) => {
  try {
    await Activity.deleteMany({});
    res.status(200).json({ success: true, message: 'All activities cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

const Payment = require('../models/Payment');

router.get('/payments', ...adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('payer', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/payments/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalRevenue, successfulPayments, pendingPayments, totalPayments] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ status: 'success' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments()
    ]);
    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        successfulPayments,
        pendingPayments,
        totalPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/analytics/overview', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalAssets, completedProjects, activeProjects] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Asset.countDocuments(),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'active' })
    ]);
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    res.status(200).json({
      success: true,
      overview: { totalUsers, totalProjects, totalAssets, completedProjects, activeProjects, completionRate }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/analytics/growth', ...adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json({ success: true, growth });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

const FAQ = require('../models/FAQ');
const Notification = require('../models/Notification');

router.get('/faqs', ...adminOnly, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/faqs', ...adminOnly, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'question and answer are required' });
    }
    const faq = await FAQ.create({ question, answer, category: category || 'General' });
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/faqs/:id', ...adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.status(200).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/faqs/:id', ...adminOnly, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/broadcast', ...adminOnly, async (req, res) => {
  try {
    const { title, message, role } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'title and message are required' });
    }
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('name email');
    const notifPromises = users.map(u => createNotification(u._id, 'system', title, message));
    await Promise.all(notifPromises);

    const emailPromises = users.filter(u => u.email).map(u => {
      const tmpl = templates.broadcast(u.name, title, message);
      return sendEmail(u.email, tmpl.subject, tmpl.html).catch(err =>
        console.error(`[${new Date().toISOString()}] Broadcast email failed for ${u.email}:`, err.message)
      );
    });
    await Promise.all(emailPromises);

    logActivity('broadcast.send', 'Notification', null, req.user._id, { title, recipientCount: users.length });
    res.status(200).json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/export/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt isVerified').sort({ createdAt: -1 });
    const csv = ['Name,Email,Role,Created,Verified'];
    users.forEach(u => csv.push(`"${u.name}","${u.email}","${u.role}","${u.createdAt.toISOString()}","${u.isVerified}"`));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.status(200).send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/export/projects', ...adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'name email').populate('assignedSpecialist', 'name email').sort({ createdAt: -1 });
    const csv = ['Title,Owner,Specialist,Status,Industry,Created'];
    projects.forEach(p => csv.push(`"${p.title}","${p.owner?.email || ''}","${p.assignedSpecialist?.email || 'Unassigned'}","${p.status}","${p.industry}","${p.createdAt.toISOString()}"`));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');
    res.status(200).send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/newsletter', ...adminOnly, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ success: false, error: 'subject and body are required' });
    }
    const subscribers = await Subscriber.find();
    let sent = 0;
    for (const sub of subscribers) {
      try {
        const tmpl = templates.broadcast(sub.email.split('@')[0], subject, body);
        await sendEmail(sub.email, tmpl.subject, tmpl.html);
        sent++;
      } catch {}
    }
    logActivity('newsletter.send', 'Subscriber', null, req.user._id, { subject, recipientCount: sent });
    res.status(200).json({ success: true, message: `Newsletter sent to ${sent} subscribers` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/specialists', ...adminOnly, async (req, res) => {
  try {
    const specialists = await User.find({ role: 'specialist' })
      .select('-password -verificationToken -resetPasswordToken -twoFactorSecret')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, specialists });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/specialists/:id/suspend', ...adminOnly, async (req, res) => {
  try {
    const { suspended, suspendedReason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { suspended, suspendedReason }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    logActivity(suspended ? 'specialist.suspend' : 'specialist.unsuspend', 'User', req.params.id, req.user._id, { reason: suspendedReason });
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, suspended: user.suspended } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/specialists/:id/availability', ...adminOnly, async (req, res) => {
  try {
    const { availability } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { availability }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, user: { id: user._id, availability: user.availability } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/specialists/:id/portfolio-approval', ...adminOnly, async (req, res) => {
  try {
    const { portfolioApproved } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { portfolioApproved }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    logActivity('portfolio.approve', 'User', req.params.id, req.user._id, { approved: portfolioApproved });
    res.status(200).json({ success: true, user: { id: user._id, portfolioApproved: user.portfolioApproved } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/reviews', ...adminOnly, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { specialist, reported } = req.query;
    const filter = {};
    if (specialist) filter.specialist = specialist;
    if (reported !== undefined) filter.reported = reported === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name email profileImage')
        .populate('specialist', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    res.status(200).json({ success: true, reviews, total });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/flagged-content', ...adminOnly, async (req, res) => {
  try {
    const ReviewReport = require('../models/ReviewReport');
    const reports = await ReviewReport.find()
      .populate({ path: 'review', populate: { path: 'reviewer specialist', select: 'name email' } })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/flagged-content/:id', ...adminOnly, async (req, res) => {
  try {
    const ReviewReport = require('../models/ReviewReport');
    const { status } = req.body;
    const report = await ReviewReport.findByIdAndUpdate(req.params.id, {
      status, reviewedBy: req.user._id, reviewedAt: new Date()
    }, { new: true });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    if (status === 'dismissed') {
      const Review = require('../models/Review');
      await Review.findByIdAndUpdate(report.review, { reported: false });
    }
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/analytics/detailed', ...adminOnly, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Review = require('../models/Review');
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [revenue, projectStats, industryStats, satisfaction] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: ['success', 'released'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
      ])
    ]);
    res.status(200).json({
      success: true,
      revenue, projectStats, industryStats,
      satisfaction: { average: satisfaction[0]?.avg || 0, total: satisfaction[0]?.total || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
