// routes/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private
router.put(
  '/:id',
  [
    authMiddleware,
    [
      body('name', 'Name is required').optional().notEmpty(),
      body('email', 'Please include a valid email').optional().isEmail()
    ]
  ],
  async (req, res) => {
    // Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, avatar } = req.body;
    
    try {
      // Build user object
      const userFields = {};
      if (name) userFields.name = name;
      if (email) userFields.email = email;
      if (avatar !== undefined) userFields.avatar = avatar;
      
      let user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // Update user
      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: userFields },
        { new: true }
      ).select('-password');
      
      res.json(user);
    } catch (err) {
      console.error(err.message);
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;