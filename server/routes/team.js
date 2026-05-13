const express = require('express');
const router = express.Router();
const { getTeam, createMember, updateMember, deleteMember } = require('../controllers/teamController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const { uploadTeam } = require('../middleware/upload');

// GET — public (everyone can see the org chart)
router.get('/', optionalProtect, getTeam);

// POST — admin only (with photo upload)
router.post('/', protect, adminOnly, uploadTeam.single('photo'), createMember);

// PUT — admin only (with optional photo update)
router.put('/:id', protect, adminOnly, uploadTeam.single('photo'), updateMember);

// DELETE — admin only
router.delete('/:id', protect, adminOnly, deleteMember);

module.exports = router;

