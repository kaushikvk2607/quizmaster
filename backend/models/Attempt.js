// models/Attempt.js
const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow anonymous attempts
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed // Can be string or array of strings
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // Time in seconds
    default: null
  },
  attemptDate: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to query attempts by quiz and user efficiently
AttemptSchema.index({ quizId: 1, userId: 1 });

module.exports = mongoose.model('Attempt', AttemptSchema);