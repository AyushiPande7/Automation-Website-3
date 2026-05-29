const db = require('../config/db');
const { deleteFiles } = require('../utils/fileHelper');

// Allowed member types — validated on every write
const VALID_TYPES = ['Director', 'Group Leader', 'member', 'director', 'team_leader', 'executive_director', 'Executive Director'];

// ─── GET /api/team  (public) ─────────────────────────────────────────────────
const getTeam = (req, res) => {
  db.all(
    'SELECT * FROM team_members ORDER BY sortOrder ASC, createdAt ASC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows || []);
    }
  );
};

// ─── POST /api/team  (admin only) ─────────────────────────────────────────────────────
const createMember = (req, res) => {
  const { name, role, type, description, sortOrder } = req.body;

  // Image: uploaded file takes priority over a URL typed in body
  const imageUrl = req.file
    ? `/uploads/team/${req.file.filename}`
    : (req.body.imageUrl || '').trim();

  // Input validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ message: 'Role / Job Title is required' });
  }

  // Map legacy strings or incoming types to the canonical versions
  let memberType = 'member';
  if (type === 'Director' || type === 'Executive Director' || type === 'director' || type === 'executive_director') {
    memberType = 'Director';
  } else if (type === 'Group Leader' || type === 'team_leader' || type === 'group_leader') {
    memberType = 'Group Leader';
  }
  const order = Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO team_members (name, role, type, description, imageUrl, sortOrder, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      role.trim(),
      memberType,
      (description || '').trim(),
      imageUrl,
      order,
      createdAt
    ],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        role: role.trim(),
        type: memberType,
        description: (description || '').trim(),
        imageUrl,
        sortOrder: order,
        createdAt
      });
    }
  );
};


// ─── PUT /api/team/:id  (admin only) ─────────────────────────────────────────────────
const updateMember = (req, res) => {
  db.get('SELECT * FROM team_members WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Team member not found' });

    const { name, role, type, description, sortOrder } = req.body;

    // Uploaded file wins over body URL which falls back to existing DB value
    const newImg = req.file
      ? `/uploads/team/${req.file.filename}`
      : (req.body.imageUrl !== undefined ? String(req.body.imageUrl).trim() : row.imageUrl);

    // If an uploaded image previously existed and it's being replaced or wiped, purge from disk
    if (newImg !== row.imageUrl && row.imageUrl && row.imageUrl.startsWith('/uploads/')) {
      deleteFiles([row.imageUrl]);
    }

    const newName  = (name  && name.trim())  ? name.trim()  : row.name;
    const newRole  = (role  && role.trim())   ? role.trim()  : row.role;
    
    let newType = row.type;
    if (type === 'Director' || type === 'Executive Director' || type === 'director' || type === 'executive_director') {
      newType = 'Director';
    } else if (type === 'Group Leader' || type === 'team_leader' || type === 'group_leader') {
      newType = 'Group Leader';
    } else if (type === 'member') {
      newType = 'member';
    }
    const newDesc  = description !== undefined  ? String(description).trim() : row.description;
    const newOrder = sortOrder   !== undefined  ? Number(sortOrder)           : row.sortOrder;

    db.run(
      `UPDATE team_members
       SET name = ?, role = ?, type = ?, description = ?, imageUrl = ?, sortOrder = ?
       WHERE id = ?`,
      [newName, newRole, newType, newDesc, newImg, newOrder, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({
          id: row.id,
          name: newName,
          role: newRole,
          type: newType,
          description: newDesc,
          imageUrl: newImg,
          sortOrder: newOrder,
          createdAt: row.createdAt
        });
      }
    );
  });
};


// ─── DELETE /api/team/:id  (admin only) ──────────────────────────────────────
const deleteMember = (req, res) => {
  db.get('SELECT imageUrl FROM team_members WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Team member not found' });

    db.run(
      'DELETE FROM team_members WHERE id = ?',
      [req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Team member not found' });
        
        // Remove locally hosted avatar
        if (row.imageUrl && row.imageUrl.startsWith('/uploads/')) {
          deleteFiles([row.imageUrl]);
        }
        res.json({ message: 'Team member deleted successfully' });
      }
    );
  });
};

// ─── PATCH /api/team/reorder  (admin only) edited by INAP ───────────────────────────────────
const reorderMembers = (req, res) => {
  const { order } = req.body;  // [{ id, sortOrder }, ...]
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'order array is required' });
  }

  db.serialize(() => {
    const stmt = db.prepare('UPDATE team_members SET sortOrder = ? WHERE id = ?');
    for (const item of order) {
      stmt.run(item.sortOrder, item.id);
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Order updated successfully' });
    });
  });
};

module.exports = { getTeam, createMember, updateMember, deleteMember, reorderMembers };
