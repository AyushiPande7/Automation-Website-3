const db = require('../config/db');

// GET /api/action-points  (admin only)
const getActionPoints = (req, res) => {
  db.get('SELECT * FROM action_points WHERE id = 1', [], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    // First access — table exists but no row yet
    if (!row) return res.json({ content: '', updatedAt: null });
    res.json(row);
  });
};

// PUT /api/action-points  (admin only)
const saveActionPoints = (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content : '';
  const updatedAt = new Date().toISOString();

  // INSERT OR REPLACE ensures upsert on the single row (id = 1)
  db.run(
    `INSERT OR REPLACE INTO action_points (id, content, updatedAt) VALUES (1, ?, ?)`,
    [content, updatedAt],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: 1, content, updatedAt });
    }
  );
};

module.exports = { getActionPoints, saveActionPoints };
