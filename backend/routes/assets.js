const express = require('express');
const router = express.Router();
const { uploadAssets, getProjectAssets, deleteAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    res.status(200).json({ success: true, url: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/upload/:projectId', protect, upload.array('files', 10), uploadAssets);
router.get('/project/:projectId', protect, getProjectAssets);
router.delete('/:id', protect, deleteAsset);

module.exports = router;
