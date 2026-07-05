const express = require('express');
const router = express.Router();
const { uploadAssets, getProjectAssets, deleteAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload/:projectId', protect, upload.array('files', 10), uploadAssets);
router.get('/project/:projectId', protect, getProjectAssets);
router.delete('/:id', protect, deleteAsset);

module.exports = router;
