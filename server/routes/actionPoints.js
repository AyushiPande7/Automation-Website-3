const express = require('express');
const router = express.Router();
const { getActionPoints, saveActionPoints } = require('../controllers/actionPointsController');
const { protect, adminOnly } = require('../middleware/auth');

// Both routes: must be logged in AND admin
router.get('/', protect, adminOnly, getActionPoints);
router.put('/', protect, adminOnly, saveActionPoints);

module.exports = router;
