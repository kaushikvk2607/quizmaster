// routes/quizzes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const authMiddleware = require('../middleware/auth');

// @route   GET api/quizzes
// @desc    Get all public quizzes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublic: true })
      .select('title description timeLimit randomizeQuestions passingScore createdBy createdAt')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Public (for public quizzes) / Private (for private quizzes)
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if quiz is public or if user is the owner
    if (!quiz.isPublic) {
      // Check if user is authenticated
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized to access this quiz' });
      }
      
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizappsecret');
        
        // Check if user is owner
        if (quiz.createdBy.toString() !== decoded.user.id) {
          return res.status(403).json({ message: 'Not authorized to access this quiz' });
        }
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/quizzes
// @desc    Create a new quiz
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      body('title', 'Title is required').notEmpty(),
      body('questions', 'At least one question is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const {
        title,
        description,
        timeLimit,
        randomizeQuestions,
        isPublic,
        passingScore,
        questions
      } = req.body;
      
      // Create new quiz
      const newQuiz = new Quiz({
        title,
        description,
        timeLimit: timeLimit || 0,
        randomizeQuestions: randomizeQuestions || false,
        isPublic: isPublic !== false, // Default to true if not specified
        passingScore: passingScore || 70,
        createdBy: req.user.id,
        questions
      });
      
      const quiz = await newQuiz.save();
      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT api/quizzes/:id
// @desc    Update a quiz
// @access  Private
router.put(
  '/:id',
  [
    authMiddleware,
    [
      body('title', 'Title is required').notEmpty(),
      body('questions', 'At least one question is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      let quiz = await Quiz.findById(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Check if user is the owner
      if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this quiz' });
      }
      
      const {
        title,
        description,
        timeLimit,
        randomizeQuestions,
        isPublic,
        passingScore,
        questions
      } = req.body;
      
      // Update quiz fields
      quiz.title = title;
      quiz.description = description;
      quiz.timeLimit = timeLimit || 0;
      quiz.randomizeQuestions = randomizeQuestions || false;
      quiz.isPublic = isPublic !== false;
      quiz.passingScore = passingScore || 70;
      quiz.questions = questions;
      quiz.updatedAt = Date.now();
      
      await quiz.save();
      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the owner or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }
    
    await quiz.remove();
    
    // Also remove all attempts for this quiz
    await Attempt.deleteMany({ quizId: req.params.id });
    
    res.json({ message: 'Quiz removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/quizzes/user/:userId
// @desc    Get all quizzes created by a user
// @access  Private
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is requesting their own quizzes or is an admin
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const quizzes = await Quiz.find({ createdBy: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/quizzes/:id/analytics
// @desc    Get analytics for a quiz
// @access  Private
router.get('/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the owner or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view analytics for this quiz' });
    }
    
    // Get all attempts for this quiz
    const attempts = await Attempt.find({ quizId: req.params.id });
    
    if (attempts.length === 0) {
      return res.status(404).json({ message: 'No attempts found for this quiz' });
    }
    
    // Calculate date range based on query parameter
    const dateRange = req.query.dateRange || 'month';
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter attempts by date range
    const filteredAttempts = attempts.filter(attempt => {
      const attemptDate = new Date(attempt.attemptDate);
      return attemptDate >= startDate && attemptDate <= now;
    });
    
    if (filteredAttempts.length === 0) {
      return res.status(404).json({ message: 'No attempts found in the specified date range' });
    }
    
    // Calculate analytics
    const totalAttempts = filteredAttempts.length;
    const passCount = filteredAttempts.filter(attempt => attempt.passed).length;
    const failCount = totalAttempts - passCount;
    const passRate = Math.round((passCount / totalAttempts) * 100);
    
    const totalScore = filteredAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    
    const attemptsWithTime = filteredAttempts.filter(attempt => attempt.timeTaken);
    const totalTime = attemptsWithTime.reduce((sum, attempt) => sum + attempt.timeTaken, 0);
    const averageTime = Math.round(totalTime / attemptsWithTime.length) || 0;
    
    // Prepare response
    const analyticsData = {
      totalAttempts,
      averageScore,
      passRate,
      passCount,
      failCount,
      averageTime,
      // Additional analytics data would be calculated here in a real app
      // This is simplified for this example
    };
    
    res.json(analyticsData);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;