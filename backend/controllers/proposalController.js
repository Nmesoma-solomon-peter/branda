const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

exports.submitProposal = async (req, res) => {
  try {
    if (req.user.role !== 'specialist') {
      return res.status(403).json({ success: false, error: 'Only specialists can submit proposals' });
    }

    const { projectId, coverLetter, bidAmount, timeline } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ success: false, error: 'Project is not accepting proposals' });
    if (project.owner.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, error: 'Cannot propose on your own project' });

    const existing = await Proposal.findOne({ project: projectId, specialist: req.user._id });
    if (existing) return res.status(400).json({ success: false, error: 'Already submitted a proposal for this project' });

    const proposal = await Proposal.create({
      specialist: req.user._id,
      project: projectId,
      coverLetter,
      bidAmount,
      timeline: timeline || 14
    });

    createNotification(project.owner, 'proposal_received', 'New Proposal Received',
      `A specialist has submitted a proposal for "${project.title}"`, `/projects/${projectId}/proposals`);

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Not authorized' });

    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate('specialist', 'name email profileImage location bio averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ specialist: req.user._id })
      .populate({
        path: 'project',
        select: 'title description industry budget status deadline'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('project specialist');
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });

    const project = proposal.project;
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Not authorized' });
    if (project.status !== 'open') return res.status(400).json({ success: false, error: 'Project is not open for proposals' });

    proposal.status = 'accepted';
    await proposal.save();

    project.assignedSpecialist = proposal.specialist._id;
    project.status = 'active';
    project.budget = proposal.bidAmount;
    await project.save();

    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    createNotification(proposal.specialist._id, 'proposal_accepted', 'Proposal Accepted!',
      `Your proposal for "${project.title}" has been accepted!`, '/specialist-dashboard');

    res.status(200).json({ success: true, proposal, project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (proposal.project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Not authorized' });

    proposal.status = 'rejected';
    await proposal.save();

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.withdrawProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (proposal.specialist.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Not authorized' });
    if (proposal.status !== 'pending') return res.status(400).json({ success: false, error: 'Cannot withdraw a non-pending proposal' });

    proposal.status = 'withdrawn';
    await proposal.save();

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
