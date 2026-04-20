const express = require('express');
const router = express.Router();

const {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  updateStatus,
  deleteIdea,
  getStats
} = require('../controllers/ideaController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Stats and List — public
router.get('/stats/summary', optionalProtect, getStats);

router
  .route('/')
  .get(optionalProtect, getIdeas)
  .post(optionalProtect, upload.array('images', 5), createIdea);

router
  .route('/:id')
  .get(optionalProtect, getIdea)
  .put(protect, adminOnly, upload.array('images', 5), updateIdea)
  .delete(protect, adminOnly, deleteIdea);

// Admin-only status update
router.patch('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
