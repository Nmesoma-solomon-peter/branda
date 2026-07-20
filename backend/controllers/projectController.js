const Project = require('../models/Project');
const Asset = require('../models/Asset');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendEmail, templates } = require('../services/email');
const { createNotification } = require('../utils/notifications');

exports.createProject = async (req, res) => {
  try {
    const { title, description, industry, colorPreferences, budget, deadline } = req.body;

    if (!title || !description || !industry) {
      return res.status(400).json({ success: false, error: 'Please provide title, description, and industry' });
    }

    const project = await Project.create({
      title,
      description,
      industry,
      colorPreferences,
      budget: budget || 0,
      deadline: deadline || null,
      owner: req.user._id
    });

    const admin = await User.findOne({ role: 'admin' });
    if (admin?.email) {
      const tmpl = templates.projectCreated(req.user.name, title);
      sendEmail(admin.email, tmpl.subject, tmpl.html).catch(err =>
        console.error(`[${new Date().toISOString()}] Project created email failed:`, err.message)
      );
    }

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .populate('assignedSpecialist', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getOpenProjects = async (req, res) => {
  try {
    const { q, industry } = req.query;
    const filter = { status: 'open' };
    if (q) filter.title = new RegExp(q, 'i');
    if (industry) filter.industry = industry;

    const projects = await Project.find(filter)
      .populate('owner', 'name')
      .select('title description industry budget deadline createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('assignedSpecialist', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner._id.toString() !== req.user._id.toString() &&
        (!project.assignedSpecialist || project.assignedSpecialist._id.toString() !== req.user._id.toString()) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const assets = await Asset.find({ project: req.params.id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    const comments = await Comment.find({ project: req.params.id })
      .populate('author', 'name role profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, project, assets, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'industry', 'colorPreferences', 'budget', 'deadline'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const assets = await Asset.find({ project: req.params.id });
    for (const asset of assets) {
      const filePath = path.join(__dirname, '..', asset.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Asset.deleteMany({ project: req.params.id });
    await Comment.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.assignedSpecialist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const allowedTransitions = {
      active: ['in_review'],
      in_review: ['completed'],
      completed: ['revision'],
      revision: ['in_review']
    };

    const allowed = allowedTransitions[project.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Cannot change status from ${project.status.replace('_', ' ')} to ${status.replace('_', ' ')}` });
    }

    project.status = status;
    await project.save();

    if (status === 'completed' && project.owner) {
      const owner = await User.findById(project.owner);
      if (owner?.email) {
        const tmpl = templates.projectCompleted(owner.name, project.title);
        sendEmail(owner.email, tmpl.subject, tmpl.html).catch(err =>
          console.error(`[${new Date().toISOString()}] Project completed email failed:`, err.message)
        );
      }
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getSpecialistProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedSpecialist: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.requestRevision = async (req, res) => {
  try {
    const { revisionNote } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (project.status !== 'in_review') {
      return res.status(400).json({ success: false, error: 'Can only request revision when project is in review' });
    }

    project.status = 'revision';
    project.revisionNote = revisionNote || '';
    await project.save();

    if (project.assignedSpecialist) {
      const specialist = await User.findById(project.assignedSpecialist);
      if (specialist?.email) {
        const tmpl = templates.revisionRequested(specialist.name, project.title, revisionNote);
        sendEmail(specialist.email, tmpl.subject, tmpl.html).catch(err =>
          console.error(`[${new Date().toISOString()}] Revision email failed:`, err.message)
        );
      }
      createNotification(project.assignedSpecialist, 'revision_request', 'Revision Requested', `Revisions requested on "${project.title}"`, '/projects');
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.acceptAssignment = async (req, res) => {
  try {
    const { action } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.assignedSpecialist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (project.acceptanceStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'Already responded to this assignment' });
    }

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    project.acceptanceStatus = action;
    if (action === 'accepted') {
      project.acceptedAt = new Date();
    }
    await project.save();

    if (action === 'accepted') {
      try {
        const Chat = require('../models/Chat');
        const existing = await Chat.findOne({ participants: { $all: [project.owner, project.assignedSpecialist] } });
        if (!existing) {
          await Chat.create({ participants: [project.owner, project.assignedSpecialist] });
        }
      } catch (e) {
        console.error('Failed to create chat on accept:', e.message);
      }
    }

    if (action === 'declined') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin?.email) {
        const tmpl = templates.broadcast(admin.name, 'Assignment Declined', `${req.user.name} declined project "${project.title}". Please assign another specialist.`);
        sendEmail(admin.email, tmpl.subject, tmpl.html).catch(err =>
          console.error(`[${new Date().toISOString()}] Decline notification email failed:`, err.message)
        );
      }
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.flagDispute = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isSpecialist = project.assignedSpecialist?.toString() === req.user._id.toString();

    if (!isOwner && !isSpecialist) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    project.status = 'dispute';
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isSpecialist = project.assignedSpecialist?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSpecialist && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const comment = await Comment.create({
      text,
      author: req.user._id,
      project: req.params.id
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name role profileImage');

    const notifyUserId = isOwner ? project.assignedSpecialist : project.owner;
    if (notifyUserId) {
      const notifyUser = await User.findById(notifyUserId);
      if (notifyUser?.email) {
        const tmpl = templates.commentNotification(notifyUser.name, req.user.name, project.title);
        sendEmail(notifyUser.email, tmpl.subject, tmpl.html).catch(err =>
          console.error(`[${new Date().toISOString()}] Comment notification email failed:`, err.message)
        );
      }
      createNotification(notifyUserId, 'comment', 'New Comment', `${req.user.name} commented on "${project.title}"`, `/projects/${project._id}`);
    }

    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
