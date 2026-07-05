const express = require('express');
const router = express.Router();
const { trackVisitor, getVisitorCount, subscribe } = require('../controllers/landingController');

router.post('/visitors', trackVisitor);
router.get('/visitors', getVisitorCount);
router.post('/subscribe', subscribe);

module.exports = router;
