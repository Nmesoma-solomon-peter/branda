const express = require('express');
const router = express.Router();
const AssetVersion = require('../models/AssetVersion');
const Asset = require('../models/Asset');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/asset/:assetId', protect, async (req, res) => {
  try {
    const versions = await AssetVersion.find({ asset: req.params.assetId })
      .populate('uploadedBy', 'name role')
      .sort({ version: -1 });
    res.status(200).json({ success: true, versions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { assetId, notes } = req.body;
    if (!assetId) {
      return res.status(400).json({ success: false, error: 'assetId is required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const lastVersion = await AssetVersion.findOne({ asset: assetId }).sort({ version: -1 });
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : asset.fileUrl;
    const fileName = req.file ? req.file.originalname : asset.originalName;
    const fileSize = req.file ? req.file.size : asset.fileSize;

    const version = await AssetVersion.create({
      asset: assetId,
      version: nextVersion,
      fileUrl,
      fileName,
      fileSize,
      uploadedBy: req.user._id,
      notes: notes || ''
    });

    if (req.file) {
      asset.fileUrl = fileUrl;
      asset.originalName = fileName;
      asset.fileSize = fileSize;
      await asset.save();
    }

    res.status(201).json({ success: true, version });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
