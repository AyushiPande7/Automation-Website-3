const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes — require valid JWT
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from SQLite instead of MongoDB
      db.get(
        `
        SELECT id, name, email, role, department
        FROM users
        WHERE id = ?
        `,
        [decoded.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }

          if (!user) {
            return res.status(401).json({ message: 'User not found' });
          }

          // Attach user to request (like before)
          req.user = user;
          next();
        }
      );
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Optional protect — does NOT block request
const optionalProtect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      db.get(
        `
        SELECT id, name, email, role, department
        FROM users
        WHERE id = ?
        `,
        [decoded.id],
        (err, user) => {
          if (user) {
            req.user = user;
          }
          next();
        }
      );
    } catch (error) {
      // Token invalid → silently ignore
      next();
    }
  } else {
    next();
  }
};

module.exports = { protect, adminOnly, optionalProtect };