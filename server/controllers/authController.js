const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
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

module.exports = { login, getMe };