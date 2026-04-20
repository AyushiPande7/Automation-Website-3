const db = require('../config/db');

/**
 * DATABASE INITIALIZATION
 * This script ensures all tables and columns exist for the SQLite migration.
 * Since SQLite ALTER TABLE is limited, we use a try-catch/if-error pattern
 * to add columns for existing databases.
 */

// 1. Create Base Tables
db.serialize(() => {
  // Ideas Table
  db.run(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      problemStatement TEXT,
      description TEXT,
      category TEXT,
      priority TEXT,
      technicalFeasibility TEXT,
      businessImpact TEXT,
      status TEXT DEFAULT 'Submitted',
      statusHistory TEXT,
      impact TEXT,
      images TEXT,
      submittedByEmail TEXT,
      submittedBy INTEGER,
      expectedDeliveryDate TEXT,
      assignedReviewer TEXT,
      outcomesAndBenefits TEXT,
      hoursSaved REAL,
      costSaved REAL,
      createdAt TEXT
    )
  `, (err) => {
    if (err) console.error('❌ Failed to create ideas table:', err.message);
    else console.log('✅ Ideas table ready');
  });

  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      department TEXT,
      createdAt TEXT
    )
  `, (err) => {
    if (err) console.error('❌ Failed to create users table:', err.message);
    else console.log('✅ Users table ready');
  });

  // 2. Structural Integrity (Lazy Migrations)
  // These ensure that if a user has an older version of the DB, the new columns are added.
  const newColumns = [
    ['problemStatement', 'TEXT'],
    ['priority', 'TEXT'],
    ['technicalFeasibility', 'TEXT'],
    ['impact', 'TEXT'],
    ['images', 'TEXT'],
    ['submittedByEmail', 'TEXT'],
    ['submittedBy', 'INTEGER'],
    ['statusHistory', 'TEXT'],
    ['businessImpact', 'TEXT'],
    ['expectedDeliveryDate', 'TEXT'],
    ['assignedReviewer', 'TEXT'],
    ['outcomesAndBenefits', 'TEXT'],
    ['hoursSaved', 'REAL'],
    ['costSaved', 'REAL']
  ];

  newColumns.forEach(([col, type]) => {
    db.run(`ALTER TABLE ideas ADD COLUMN ${col} ${type}`, (err) => {
      // "Duplicate column name" error is ignored
      if (!err) console.log(`✅ Added column: ${col}`);
    });
  });
});