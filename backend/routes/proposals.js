const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal
} = require('../controllers/proposalController');

router.post('/', protect, submitProposal);
router.get('/mine', protect, getMyProposals);
router.get('/project/:projectId', protect, getProjectProposals);
router.put('/:id/accept', protect, acceptProposal);
router.put('/:id/reject', protect, rejectProposal);
router.put('/:id/withdraw', protect, withdrawProposal);

module.exports = router;
