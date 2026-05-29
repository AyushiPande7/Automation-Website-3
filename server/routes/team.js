const express = require('express');
const router = express.Router();
const { getTeam, createMember, updateMember, deleteMember, reorderMembers } = require('../controllers/teamController');  /* edited by INAP */
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const { uploadTeam } = require('../middleware/upload');

// GET — public (everyone can see the org chart)
router.get('/', optionalProtect, getTeam);

// POST — admin only (with photo upload)
router.post('/', protect, adminOnly, uploadTeam.single('photo'), createMember);

// PATCH — admin only (batch reorder) edited by INAP 
router.patch('/reorder', protect, adminOnly, reorderMembers);

// PUT — admin only (with optional photo update)
router.put('/:id', protect, adminOnly, uploadTeam.single('photo'), updateMember);

// DELETE — admin only
router.delete('/:id', protect, adminOnly, deleteMember);

module.exports = router;

