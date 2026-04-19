const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create path to database file
const dbPath = path.join(__dirname, '../database/app.db');

// Open SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite:', err.message);
  } else {
    console.log('✅ SQLite database connected');
  }
});

module.exports = db;