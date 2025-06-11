// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role, // optional: defaults to 'jobseeker'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// === GOOGLE AUTH ROUTES ===

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/sign_up_login', session: false }),
  (req, res) => {
    // Optional: generate JWT or session here
    res.redirect('http://localhost:3000/dashboard'); // frontend redirect
  }
);

const jwt = require('jsonwebtoken');
const SECRET = 'your_secret_key'; // ✅ Store this in .env

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // ✅ Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token, // ✅ Return token
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
