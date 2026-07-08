// ============================================================================
// Authentication Routes
// ============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, firstName, lastName, departmentId, role = 'trainee' } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // In real app, save to database
    // const user = await User.create({
    //   email,
    //   password_hash: hashedPassword,
    //   first_name: firstName,
    //   last_name: lastName,
    //   department_id: departmentId,
    //   role
    // });

    res.json({
      message: 'User registered successfully',
      userId: 'generated-uuid-here',
      role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // In real app: const user = await User.findOne({ where: { email } });
    // For demo:
    const user = {
      id: 'user-uuid-123',
      email: email,
      password_hash: await bcrypt.hash(password, 10),
      first_name: 'John',
      role: 'trainee'
    };

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me (verify token)
router.get('/me', verifyToken, async (req, res) => {
  try {
    // In real app: const user = await User.findByPk(req.userId);
    res.json({
      id: req.userId,
      role: req.userRole,
      email: 'user@example.com'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  // In real app, could invalidate token in blacklist
  res.json({ message: 'Logged out successfully' });
});

module.exports = { router, verifyToken };
