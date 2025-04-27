// models/Quiz.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
});

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple', 'checkbox', 'true-false'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  options: [OptionSchema],
  required: {
    type: Boolean,
    default: true
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timeLimit: {
    type: Number, // Time limit in minutes, 0 for no limit
    default: 0,
    min: 0
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
QuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);
