// routes/auth.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password } = req.body;
    
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      user = new User({
        name,
        email,
        password
      });
      
      await user.save();
      
      // Create JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'quizappsecret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Create JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'quizappsecret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET api/auth/user
// @desc    Get authenticated user
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;