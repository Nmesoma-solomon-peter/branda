const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getSpecialistReviews,
  getMyReview,
  updateReview,
  deleteReview,
  respondToReview
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/specialist/:id', getSpecialistReviews);
router.get('/my/:projectId', protect, getMyReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/respond', protect, respondToReview);

module.exports = router;
