const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getSpecialistProjects,
  requestRevision,
  acceptAssignment,
  flagDispute,
  addComment,
  deleteComment
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('sme'), createProject);
router.get('/', protect, authorize('sme'), getProjects);
router.get('/specialist', protect, authorize('specialist'), getSpecialistProjects);
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('sme'), updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/status', protect, authorize('specialist'), updateProjectStatus);
router.put('/:id/revision', protect, authorize('sme'), requestRevision);
router.put('/:id/accept', protect, authorize('specialist'), acceptAssignment);
router.put('/:id/dispute', protect, flagDispute);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;
