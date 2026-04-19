const db = require('../config/db');

// GET /api/ideas
const getIdeas = (req, res) => {
  const { status, category, search } = req.query;
  let query = 'SELECT * FROM ideas';
  let params = [];
  let conditions = [];

  if (status && status !== 'All') {
    conditions.push('status = ?');
    params.push(status);
  }
  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR problemStatement LIKE ?)');
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY datetime(createdAt) DESC';

  db.all(
    query,
    params,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      const normalized = rows.map((row) => ({
        ...row,
        _id: String(row.id),

        // ✅ ALWAYS an array
        images: row.images
          ? JSON.parse(row.images)
          : [],

        // ✅ ALWAYS an object
        impact: row.impact
          ? JSON.parse(row.impact)
          : {},

        // ✅ ALWAYS an array
        statusHistory: row.statusHistory
          ? JSON.parse(row.statusHistory)
          : [],
      }));

      res.json(normalized);
    }
  );
};

// @desc    Get single idea by ID
// GET /api/ideas/:id
const getIdea = (req, res) => {
  db.get(
    'SELECT * FROM ideas WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (!row) {
        return res.status(404).json({ message: 'Idea not found' });
      }

      res.json({
        ...row,
        _id: String(row.id),
        images: row.images
          ? JSON.parse(row.images)
          : [],
        impact: row.impact
          ? JSON.parse(row.impact)
          : {},
        statusHistory: row.statusHistory
          ? JSON.parse(row.statusHistory)
          : [],
      });
    }
  );
};

// @desc    Create new idea
// POST /api/ideas
const createIdea = (req, res) => {
  try {
    const {
      title,
      problemStatement,
      description,
      category,
      priority,
      technicalFeasibility,
      businessImpact,
      expectedDeliveryDate,
      assignedReviewer,
      outcomesAndBenefits,
      submittedByEmail,
      impact,
      hoursSaved,
      costSaved,
      createdAt
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse impact JSON safely
    let parsedImpact = {};
    if (impact) {
      try {
        parsedImpact = JSON.parse(impact);
      } catch {
        parsedImpact = {};
      }
    }

    // Collect uploaded image paths (local storage)
    const imagePaths = req.files
      ? req.files.map((file) =>
          `/uploads/ideas/${file.filename}`
        )
      : [];

    // Determine submitter
    const submitterId = req.user ? req.user.id : null;

    const submissionDate = createdAt || new Date().toISOString();
    
    const initialHistory = [{
      status: 'Pending',
      date: submissionDate,
      note: 'Idea submitted',
      updatedBy: submitterId
    }];

    db.run(
      `
      INSERT INTO ideas (
        title,
        problemStatement,
        description,
        category,
        priority,
        technicalFeasibility,
        status,
        statusHistory,
        impact,
        images,
        submittedByEmail,
        businessImpact,
        expectedDeliveryDate,
        assignedReviewer,
        outcomesAndBenefits,
        hoursSaved,
        costSaved,
        submittedBy,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        problemStatement,
        description,
        category,
        priority,
        technicalFeasibility,
        'Pending',
        JSON.stringify(initialHistory),
        JSON.stringify(parsedImpact),
        JSON.stringify(imagePaths),
        submittedByEmail,
        businessImpact || null,
        expectedDeliveryDate || null,
        assignedReviewer || null,
        outcomesAndBenefits || null,
        hoursSaved || 0,
        costSaved || 0,
        submitterId,
        submissionDate
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        res.status(201).json({
          id: this.lastID,
          _id: String(this.lastID),
          title,
          problemStatement,
          description,
          category,
          priority,
          technicalFeasibility,
          status: 'Pending',
          statusHistory: initialHistory,
          impact: parsedImpact,
          images: imagePaths,
          submittedByEmail,
          businessImpact,
          expectedDeliveryDate,
          assignedReviewer,
          outcomesAndBenefits,
          hoursSaved: hoursSaved || 0,
          costSaved: costSaved || 0,
          submittedBy: submitterId,
          createdAt: submissionDate
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update idea details
// PUT /api/ideas/:id
const updateIdea = (req, res) => {
  const { title, problemStatement, description, category, priority, technicalFeasibility, status, impact, deletedImages, businessImpact, expectedDeliveryDate, assignedReviewer, outcomesAndBenefits, hoursSaved, costSaved, createdAt } = req.body;

  // 1. Parse JSON fields
  let parsedImpact = {};
  if (impact) {
    try { parsedImpact = JSON.parse(impact); } catch { parsedImpact = {}; }
  }

  let parsedDeleted = [];
  if (deletedImages) {
    try { parsedDeleted = JSON.parse(deletedImages); } catch { parsedDeleted = []; }
  }

  // 2. Fetch existing idea to handle images
  db.get('SELECT * FROM ideas WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Idea not found' });

    let existingImages = [];
    if (row.images) {
      try { existingImages = JSON.parse(row.images); } catch { existingImages = []; }
    }

    // 3. Remove deleted images
    let updatedImages = existingImages.filter(img => !parsedDeleted.includes(img));

    // 4. Append newly uploaded images
    const newImagePaths = req.files ? req.files.map((file) => `/uploads/ideas/${file.filename}`) : [];
    updatedImages = [...updatedImages, ...newImagePaths];

    // Determine values to update (fallback to existing if not provided)
    const newTitle = title || row.title;
    const newProblemStatement = problemStatement || row.problemStatement;
    const newDescription = description || row.description;
    const newCategory = category || row.category;
    const newPriority = priority || row.priority;
    const newTechnicalFeasibility = technicalFeasibility || row.technicalFeasibility;
    const newBusinessImpact = businessImpact !== undefined ? businessImpact : row.businessImpact;
    const newExpectedDeliveryDate = expectedDeliveryDate !== undefined ? expectedDeliveryDate : row.expectedDeliveryDate;
    const newAssignedReviewer = assignedReviewer !== undefined ? assignedReviewer : row.assignedReviewer;
    const newOutcomesAndBenefits = outcomesAndBenefits !== undefined ? outcomesAndBenefits : row.outcomesAndBenefits;
    const newHoursSaved = hoursSaved !== undefined ? hoursSaved : row.hoursSaved;
    const newCostSaved = costSaved !== undefined ? costSaved : row.costSaved;
    const newStatus = status || row.status;
    const newImpact = impact ? JSON.stringify(parsedImpact) : row.impact;
    const newCreatedAt = createdAt || row.createdAt;

    // 5. Update DB
    db.run(
      `
      UPDATE ideas
      SET title = ?, problemStatement = ?, description = ?, category = ?, priority = ?, technicalFeasibility = ?, status = ?, impact = ?, images = ?, businessImpact = ?, expectedDeliveryDate = ?, assignedReviewer = ?, outcomesAndBenefits = ?, hoursSaved = ?, costSaved = ?, createdAt = ?
      WHERE id = ?
      `,
      [newTitle, newProblemStatement, newDescription, newCategory, newPriority, newTechnicalFeasibility, newStatus, newImpact, JSON.stringify(updatedImages), newBusinessImpact, newExpectedDeliveryDate, newAssignedReviewer, newOutcomesAndBenefits, newHoursSaved, newCostSaved, newCreatedAt, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: err.message });

        res.json({
          ...row,
          _id: String(row.id),
          title: newTitle,
          problemStatement: newProblemStatement,
          description: newDescription,
          category: newCategory,
          priority: newPriority,
          technicalFeasibility: newTechnicalFeasibility,
          status: newStatus,
          impact: newImpact ? JSON.parse(newImpact) : {},
          images: updatedImages,
          businessImpact: newBusinessImpact,
          expectedDeliveryDate: newExpectedDeliveryDate,
          assignedReviewer: newAssignedReviewer,
          outcomesAndBenefits: newOutcomesAndBenefits,
          hoursSaved: newHoursSaved,
          costSaved: newCostSaved,
          createdAt: newCreatedAt,
          statusHistory: row.statusHistory ? JSON.parse(row.statusHistory) : []
        });
      }
    );
  });
};

// @desc    Update idea status (admin only)
// PATCH /api/ideas/:id/status
const updateStatus = (req, res) => {
  const { status, note, date } = req.body;

  const validStatuses = [
    'Pending',
    'Approved',
    'In Progress',
    'Implemented',
    'Rejected'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // Step 1: Fetch existing statusHistory
  db.get(
    'SELECT * FROM ideas WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (!row) {
        return res.status(404).json({ message: 'Idea not found' });
      }

      // Step 2: Parse existing history or start empty
      let history = [];
      if (row.statusHistory) {
        try {
          history = JSON.parse(row.statusHistory);
        } catch {
          history = [];
        }
      }

      // Step 3: Append new entry
      history.push({
        status,
        date: date || new Date().toISOString(),
        note: note || `Status updated to ${status}`,
        updatedBy: req.user.id
      });

      // Step 4: Save back to SQLite
      db.run(
        `
        UPDATE ideas
        SET status = ?, statusHistory = ?
        WHERE id = ?
        `,
        [
          status,
          JSON.stringify(history),
          req.params.id
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ message: err.message });
          }

          res.json({
            ...row,
            _id: String(row.id),
            status,
            statusHistory: history,
            images: row.images ? JSON.parse(row.images) : [],
            impact: row.impact ? JSON.parse(row.impact) : {}
          });
        }
      );
    }
  );
};

// @desc    Delete an idea
// DELETE /api/ideas/:id
const deleteIdea = (req, res) => {
  db.run(
    'DELETE FROM ideas WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Idea not found' });
      }

      res.json({ message: 'Idea deleted successfully' });
    }
  );
};

// @desc    Get summary stats
// GET /api/ideas/stats/summary
const getStats = (req, res) => {
  db.get('SELECT COUNT(*) as total FROM ideas', [], (err, totalRow) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    db.all(
      'SELECT status as _id, COUNT(*) as count FROM ideas GROUP BY status',
      [],
      (err, byStatus) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        db.all(
          'SELECT category as _id, COUNT(*) as count FROM ideas GROUP BY category',
          [],
          (err, byCategory) => {
            if (err) {
              return res.status(500).json({ message: err.message });
            }

            db.get(
              'SELECT SUM(hoursSaved) as totalHours, SUM(costSaved) as totalCost FROM ideas',
              [],
              (err, impactRow) => {
                if (err) {
                  return res.status(500).json({ message: err.message });
                }

                res.json({
                  total: totalRow.total,
                  byStatus,
                  byCategory,
                  impact: {
                    totalHours: impactRow.totalHours || 0,
                    totalCost: impactRow.totalCost || 0
                  }
                });
              }
            );
          }
        );
      }
    );
  });
};

module.exports = {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  updateStatus,
  deleteIdea,
  getStats
};
