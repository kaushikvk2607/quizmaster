// routes/attempts.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const authMiddleware = require('../middleware/auth');
// const optionalAuth = require('../middleware/optionalAuth');

// @route   POST api/attempts
// @desc    Submit a quiz attempt
// @access  Public (anonymous) / Private (authenticated)
router.post(
  '/',
//   [
//     optionalAuth,
//     [
//       body('quizId', 'Quiz ID is required').notEmpty(),
//       body('answers', 'Answers are required').isObject()
//     ]
//   ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { quizId, answers, timeTaken } = req.body;
      
      // Get the quiz
      const quiz = await Quiz.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Check if quiz is public or if user is authenticated
      if (!quiz.isPublic && !req.user) {
        return res.status(401).json({ message: 'Not authorized to attempt this quiz' });
      }
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      const questionResults = {};
      
      quiz.questions.forEach(question => {
        totalPoints += question.points || 1;
        const userAnswer = answers[question.id];
        
        let isCorrect = false;
        
        if (question.type === 'checkbox') {
          // For multiple answer questions, all correct options must be selected
          // and no incorrect options should be selected
          const correctOptions = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text);
          
          const userSelectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
          
          isCorrect = 
            correctOptions.length === userSelectedOptions.length &&
            correctOptions.every(opt => userSelectedOptions.includes(opt));
        } else {
          // For single answer questions, check if the answer matches any correct option
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && userAnswer === correctOption.text;
        }
        
        if (isCorrect) {
          correctAnswers += question.points || 1;
        }
        
        questionResults[question.id] = {
          correct: isCorrect,
          points: isCorrect ? (question.points || 1) : 0
        };
      });
      
      const score = Math.round((correctAnswers / totalPoints) * 100);
      const passed = score >= quiz.passingScore;
      
      // Create new attempt
      const newAttempt = new Attempt({
        quizId,
        userId: req.user ? req.user.id : null,
        answers,
        score,
        passed,
        timeTaken: timeTaken || null
      });
      
      const attempt = await newAttempt.save();
      
      // Return result
      const result = {
        attemptId: attempt._id,
        score,
        passed,
        questionResults,
        // Include more detailed results if needed
      };
      
      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET api/attempts
// @desc    Get all attempts for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id })
      .sort({ attemptDate: -1 });
    
    res.json(attempts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/attempts/quiz/:quizId
// @desc    Get all attempts for a specific quiz (admin or quiz owner only)
// @access  Private
router.get('/quiz/:quizId', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the quiz owner or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view attempts for this quiz' });
    }
    
    const attempts = await Attempt.find({ quizId: req.params.quizId })
      .sort({ attemptDate: -1 });
    
    res.json(attempts);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/attempts/leaderboard/:quizId
// @desc    Get leaderboard for a specific quiz
// @access  Public
router.get('/leaderboard/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if quiz is public
    if (!quiz.isPublic) {
      return res.status(403).json({ message: 'Leaderboard not available for private quizzes' });
    }
    
    // Get top attempts by score
    const attempts = await Attempt.find({ quizId: req.params.quizId })
      .populate('userId', 'name avatar')
      .sort({ score: -1, timeTaken: 1 }) // Sort by score (desc) and time (asc)
      .limit(100);
    
    // Transform to leaderboard entries
    const leaderboard = attempts.map(attempt => ({
      id: attempt._id,
      userId: attempt.userId ? attempt.userId._id : null,
      userName: attempt.userId ? attempt.userId.name : 'Anonymous User',
      userAvatar: attempt.userId ? attempt.userId.avatar : null,
      score: attempt.score,
      passed: attempt.passed,
      timeTaken: attempt.timeTaken,
      attemptDate: attempt.attemptDate
    }));
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;