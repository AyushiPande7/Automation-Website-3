const express = require('express');
const router = express.Router();

const {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  updateStatus,
  updatePipeline,
  deleteIdea,
  getStats
} = require('../controllers/ideaController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Stats and List — public
router.get('/stats/summary', optionalProtect, getStats);

router
  .route('/')
  .get(optionalProtect, getIdeas)
  .post(optionalProtect, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'artefacts', maxCount: 10 }, { name: 'documents', maxCount: 10 }]), createIdea);

router
  .route('/:id')
  .get(optionalProtect, getIdea)
  .put(protect, adminOnly, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'artefacts', maxCount: 10 }, { name: 'documents', maxCount: 10 }]), updateIdea)
  .delete(protect, adminOnly, deleteIdea);

// Admin-only status update
router.patch('/:id/status', protect, adminOnly, updateStatus);

// Admin-only pipeline update (tick/deadline)
router.patch('/:id/pipeline', protect, adminOnly, updatePipeline);

module.exports = router;

