const Asset = require('../models/Asset');
const Project = require('../models/Project');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendEmail, templates } = require('../services/email');

exports.uploadAssets = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() &&
        (!project.assignedSpecialist || project.assignedSpecialist.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one file' });
    }

    const assets = [];
    for (const file of req.files) {
      const asset = await Asset.create({
        filename: file.filename,
        originalName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user._id,
        project: req.params.projectId,
        type: req.body.type || 'reference'
      });
      assets.push(asset);
    }

    const isSpecialistUpload = project.assignedSpecialist?.toString() === req.user._id.toString();
    if (isSpecialistUpload && project.owner) {
      const owner = await User.findById(project.owner);
      if (owner?.email) {
        const tmpl = templates.deliverableUploaded(owner.name, project.title);
        sendEmail(owner.email, tmpl.subject, tmpl.html).catch(err =>
          console.error(`[${new Date().toISOString()}] Deliverable upload email failed:`, err.message)
        );
      }
    }

    res.status(201).json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getProjectAssets = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() &&
        (!project.assignedSpecialist || project.assignedSpecialist.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const assets = await Asset.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    if (asset.uploadedBy.toString() !== req.user._id.toString()) {
      const project = await Project.findById(asset.project);
      if (!project || project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }
    }

    const filePath = path.join(__dirname, '..', asset.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
