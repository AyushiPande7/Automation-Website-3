const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// REGISTER
const register = (req, res) => {
  const { name, email, password, department, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.get(
    'SELECT id FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        `
        INSERT INTO users (name, email, password, role, department, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          email,
          hashedPassword,
          role || 'user',
          department || null,
          new Date().toISOString()
        ],
        function (err) {
          if (err) return res.status(500).json({ message: err.message });

          res.status(201).json({
            id: this.lastID,
            _id: String(this.lastID),
            name,
            email,
            role: role || 'user',
            department,
            token: generateToken(this.lastID)
          });
        }
      );
    }
  );
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        id: user.id,
        _id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user.id)
      });
    }
  );
};

// GET ME
const getMe = (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };