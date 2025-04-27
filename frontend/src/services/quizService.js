// services/quizService.js
import api from './api';

// For demo purposes, mock quiz storage
const QUIZZES_KEY = 'quiz_app_quizzes';
const ATTEMPTS_KEY = 'quiz_app_attempts';

// Helper to get quizzes from localStorage
const getQuizzesAll = () => {
  const quizzesJson = localStorage.getItem(QUIZZES_KEY);
  return quizzesJson ? JSON.parse(quizzesJson) : [];
};

// Helper to save quizzes to localStorage
const saveQuizzes = (quizzes) => {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
};

// Helper to get attempts from localStorage
const getAttempts = () => {
  const attemptsJson = localStorage.getItem(ATTEMPTS_KEY);
  return attemptsJson ? JSON.parse(attemptsJson) : [];
};

// Helper to save attempts to localStorage
const saveAttempts = (attempts) => {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
};

// Get all public quizzes
export const getQuizzes = async () => {
  // In a real app, this would make an API call
  // return api.get('/quizzes');
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const quizzes = getQuizzesAll();
    
    // Only return public quizzes
    return quizzes.filter(quiz => quiz.isPublic !== false);
  } catch (error) {
    throw error;
  }
};

// Get quizzes created by a specific user
export const getUserQuizzes = async (userId) => {
  // In a real app, this would make an API call
  // return api.get(`/users/${userId}/quizzes`);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const quizzes = getQuizzesAll();
    
    // Get attempts to count for each quiz
    const attempts = getAttempts();
    const attemptCounts = {};
    
    attempts.forEach(attempt => {
      if (!attemptCounts[attempt.quizId]) {
        attemptCounts[attempt.quizId] = 0;
      }
      attemptCounts[attempt.quizId]++;
    });
    
    // Return quizzes by this user with attempt counts
    return quizzes
      .filter(quiz => quiz.createdBy === userId)
      .map(quiz => ({
        ...quiz,
        attempts: attemptCounts[quiz.id] || 0
      }));
  } catch (error) {
    throw error;
  }
};

// Get a single quiz by ID
export const getQuiz = async (quizId) => {
  // In a real app, this would make an API call
  // return api.get(`/quizzes/${quizId}`);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const quizzes = getQuizzesAll();
    
    // Find quiz by ID
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    return quiz;
  } catch (error) {
    throw error;
  }
};

// Create a new quiz
export const createQuiz = async (quizData) => {
  // In a real app, this would make an API call
  // return api.post('/quizzes', quizData);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const quizzes = getQuizzesAll();
    
    // Create new quiz with ID
    const newQuiz = {
      ...quizData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to "database"
    quizzes.push(newQuiz);
    saveQuizzes(quizzes);
    
    return newQuiz;
  } catch (error) {
    throw error;
  }
};

// Update an existing quiz
export const updateQuiz = async (quizId, quizData) => {
  // In a real app, this would make an API call
  // return api.put(`/quizzes/${quizId}`, quizData);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const quizzes = getQuizzesAll();
    
    // Find quiz index
    const index = quizzes.findIndex(q => q.id === quizId);
    
    if (index === -1) {
      throw new Error('Quiz not found');
    }
    
    // Check if user is the owner
    if (quizzes[index].createdBy !== quizData.createdBy) {
      throw new Error('You do not have permission to update this quiz');
    }
    
    // Update quiz
    const updatedQuiz = {
      ...quizzes[index],
      ...quizData,
      updatedAt: new Date().toISOString()
    };
    
    quizzes[index] = updatedQuiz;
    saveQuizzes(quizzes);
    
    return updatedQuiz;
  } catch (error) {
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
  // In a real app, this would make an API call
  // return api.delete(`/quizzes/${quizId}`);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const quizzes = getQuizzesAll();
    
    // Find quiz index
    const index = quizzes.findIndex(q => q.id === quizId);
    
    if (index === -1) {
      throw new Error('Quiz not found');
    }
    
    // Remove quiz
    quizzes.splice(index, 1);
    saveQuizzes(quizzes);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Duplicate an existing quiz
export const duplicateQuiz = async (quizId) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const quizzes = getQuizzesAll();
    
    // Find original quiz
    const originalQuiz = quizzes.find(q => q.id === quizId);
    
    if (!originalQuiz) {
      throw new Error('Quiz not found');
    }
    
    // Create duplicate with new ID and updated timestamps
    const duplicatedQuiz = {
      ...originalQuiz,
      id: Date.now().toString(),
      title: `${originalQuiz.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to "database"
    quizzes.push(duplicatedQuiz);
    saveQuizzes(quizzes);
    
    return duplicatedQuiz;
  } catch (error) {
    throw error;
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (attemptData) => {
  // In a real app, this would make an API call
  // return api.post('/attempts', attemptData);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const quizzes = getQuizzesAll();
    const attempts = getAttempts();
    
    // Find quiz
    const quiz = quizzes.find(q => q.id === attemptData.quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = {};
    const userAnswers = {};
    
    quiz.questions.forEach(question => {
      totalPoints += question.points || 1;
      const userAnswer = attemptData.answers[question.id];
      userAnswers[question.id] = userAnswer;
      
      let isCorrect = false;
      
      if (question.type === 'checkbox') {
        // For multiple answer questions, all correct options must be selected
        // and no incorrect options should be selected
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text);
        
        const userSelectedOptions = userAnswer || [];
        
        isCorrect = 
          correctOptions.length === userSelectedOptions.length &&
          correctOptions.every(opt => userSelectedOptions.includes(opt));
      } else {
        // For single answer questions, check if the answer matches any correct option
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && userAnswer === correctOption.text;
      }
      
      if (isCorrect) {
        correctAnswers += 1;
      }
      
      questionResults[question.id] = {
        correct: isCorrect,
        points: isCorrect ? (question.points || 1) : 0
      };
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    // Create attempt record
    const attempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      userId: attemptData.userId,
      userName: attemptData.userId ? 'User ' + attemptData.userId.slice(0, 5) : 'Anonymous User',
      answers: attemptData.answers,
      score,
      passed,
      timeTaken: attemptData.timeTaken,
      attemptDate: new Date().toISOString()
    };
    
    // Save to "database"
    attempts.push(attempt);
    saveAttempts(attempts);
    
    // Return results
    return {
      score,
      passed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      questionResults,
      userAnswers,
      timeTaken: attemptData.timeTaken
    };
  } catch (error) {
    throw error;
  }
};

// Get leaderboard data
export const getLeaderboard = async (quizId = null) => {
  // In a real app, this would make an API call
  // return api.get('/leaderboard', { params: { quizId } });
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const quizzes = getQuizzesAll();
    const attempts = getAttempts();
    
    // Filter attempts by quiz if quizId is provided
    const filteredAttempts = quizId
      ? attempts.filter(a => a.quizId === quizId)
      : attempts;
    
    // Map quizzes by ID for quick lookup
    const quizzesById = {};
    quizzes.forEach(quiz => {
      quizzesById[quiz.id] = quiz;
    });
    
    // Transform attempts to leaderboard entries
    const leaderboardData = filteredAttempts.map(attempt => ({
      id: attempt.id,
      userId: attempt.userId,
      userName: attempt.userName,
      userAvatar: null, // In a real app, this would come from user data
      quizId: attempt.quizId,
      quizTitle: quizzesById[attempt.quizId]?.title || 'Unknown Quiz',
      score: attempt.score,
      passed: attempt.passed,
      timeTaken: attempt.timeTaken,
      attemptDate: attempt.attemptDate
    }));
    
    // Sort by score (desc) and then by time taken (asc)
    leaderboardData.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // If scores are tied, faster time wins
      if (a.timeTaken && b.timeTaken) {
        return a.timeTaken - b.timeTaken;
      }
      
      return 0;
    });
    
    return leaderboardData;
  } catch (error) {
    throw error;
  }
};

// Get analytics data for a quiz
export const getQuizAnalytics = async (quizId, dateRange = 'month') => {
  // In a real app, this would make an API call
  // return api.get(`/quizzes/${quizId}/analytics`, { params: { dateRange } });
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const quizzes = getQuizzesAll();
    const attempts = getAttempts();
    
    // Find quiz
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Filter attempts for this quiz
    const quizAttempts = attempts.filter(a => a.quizId === quizId);
    
    if (quizAttempts.length === 0) {
      throw new Error('No attempts found for this quiz');
    }
    
    // Calculate date range
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
    const filteredAttempts = quizAttempts.filter(a => {
      const attemptDate = new Date(a.attemptDate);
      return attemptDate >= startDate && attemptDate <= now;
    });
    
    // Count total attempts
    const totalAttempts = filteredAttempts.length;
    
    // Calculate average score
    const totalScore = filteredAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = Math.round(totalScore / totalAttempts) || 0;
    
    // Calculate pass rate
    const passCount = filteredAttempts.filter(a => a.passed).length;
    const failCount = totalAttempts - passCount;
    const passRate = Math.round((passCount / totalAttempts) * 100) || 0;
    
    // Calculate average time
    const attemptWithTime = filteredAttempts.filter(a => a.timeTaken);
    const totalTime = attemptWithTime.reduce((sum, attempt) => sum + attempt.timeTaken, 0);
    const averageTime = Math.round(totalTime / attemptWithTime.length) || 0;
    
    // Generate attempts over time data
    const attemptsOverTime = generateTimeSeriesData(filteredAttempts, dateRange);
    
    // Generate score distribution
    const scoreDistribution = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];
    
    filteredAttempts.forEach(attempt => {
      if (attempt.score <= 20) {
        scoreDistribution[0].count++;
      } else if (attempt.score <= 40) {
        scoreDistribution[1].count++;
      } else if (attempt.score <= 60) {
        scoreDistribution[2].count++;
      } else if (attempt.score <= 80) {
        scoreDistribution[3].count++;
      } else {
        scoreDistribution[4].count++;
      }
    });
    
    // Calculate question performance
    const questionPerformance = [];
    const questionAnalysis = [];
    
    quiz.questions.forEach((question, index) => {
      let correctCount = 0;
      let totalTime = 0;
      let timeCount = 0;
      
      // For each question, loop through all attempts to calculate performance
      filteredAttempts.forEach(attempt => {
        const userAnswer = attempt.answers[question.id];
        
        // Skip if no answer was provided
        if (!userAnswer) return;
        
        let isCorrect = false;
        
        if (question.type === 'checkbox') {
          // For multiple answer questions
          const correctOptions = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text);
          
          const userSelectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
          
          isCorrect = 
            correctOptions.length === userSelectedOptions.length &&
            correctOptions.every(opt => userSelectedOptions.includes(opt));
        } else {
          // For single answer questions
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && userAnswer === correctOption.text;
        }
        
        if (isCorrect) {
          correctCount++;
        }
        
        // In a real app, we would track time per question
        // Here we're just using a random value for demo purposes
        const questionTime = Math.random() * 30 + 5; // 5-35 seconds
        totalTime += questionTime;
        timeCount++;
      });
      
      const successRate = Math.round((correctCount / totalAttempts) * 100) || 0;
      
      questionPerformance.push({
        questionNumber: `Q${index + 1}`,
        correctPercentage: successRate,
      });
      
      questionAnalysis.push({
        id: question.id,
        text: question.text.length > 50 ? question.text.substring(0, 50) + '...' : question.text,
        type: question.type,
        attempts: totalAttempts,
        correctCount,
        successRate,
        averageTime: totalTime / timeCount || 0,
      });
    });
    
    // Calculate changes from previous period
    // In a real app, this would compare with actual data from the previous period
    // Here we're just using random values for demo purposes
    const attemptsChange = generateRandomChange();
    const scoreChange = generateRandomChange();
    const passRateChange = generateRandomChange();
    const timeChange = generateRandomChange();
    
    return {
      totalAttempts,
      averageScore,
      passRate,
      passCount,
      failCount,
      averageTime,
      attemptsOverTime,
      scoreDistribution,
      questionPerformance,
      questionAnalysis,
      attemptsChange,
      scoreChange,
      passRateChange,
      timeChange
    };
  } catch (error) {
    throw error;
  }
};

// Helper function to generate time series data for attempts over time
const generateTimeSeriesData = (attempts, dateRange) => {
  if (attempts.length === 0) {
    return [];
  }
  
  const now = new Date();
  const result = [];
  
  // Determine number of data points and interval based on date range
  let dataPoints = 7;
  let intervalDays = 1;
  let dateFormat = 'MM/DD';
  
  switch (dateRange) {
    case 'week':
      dataPoints = 7;
      intervalDays = 1;
      break;
    case 'month':
      dataPoints = 30;
      intervalDays = 1;
      break;
    case 'year':
      dataPoints = 12;
      intervalDays = 30;
      dateFormat = 'MMM';
      break;
    case 'all':
      // If "all time", use months as intervals
      dataPoints = 12;
      intervalDays = 30;
      dateFormat = 'MMM YY';
      break;
  }
  
  // Create date buckets
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    date.setDate(now.getDate() - (dataPoints - 1 - i) * intervalDays);
    
    const formattedDate = formatDate(date, dateFormat);
    
    result.push({
      date: formattedDate,
      attempts: 0
    });
  }
  
  // Count attempts in each bucket
  attempts.forEach(attempt => {
    const attemptDate = new Date(attempt.attemptDate);
    
    // Find the matching bucket
    for (let i = 0; i < dataPoints; i++) {
      const bucketStartDate = new Date();
      bucketStartDate.setDate(now.getDate() - (dataPoints - 1 - i) * intervalDays);
      
      const bucketEndDate = new Date(bucketStartDate);
      bucketEndDate.setDate(bucketStartDate.getDate() + intervalDays);
      
      if (attemptDate >= bucketStartDate && attemptDate < bucketEndDate) {
        result[i].attempts++;
        break;
      }
    }
  });
  
  return result;
};

// Helper function to format dates
const formatDate = (date, format) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const monthName = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  
  switch (format) {
    case 'MM/DD':
      return `${month}/${day}`;
    case 'MMM':
      return monthName;
    case 'MMM YY':
      return `${monthName} '${year}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

// Helper function to generate a random percentage change for demo purposes
const generateRandomChange = () => {
  return Math.floor(Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1);
};

// Initialize the quiz service with some sample quizzes
export const initializeQuizService = () => {
  const quizzes = getQuizzesAll();
  
  if (quizzes.length === 0) {
    const sampleQuizzes = [
      {
        id: '1',
        title: 'Web Development Basics',
        description: 'Test your knowledge of web development fundamentals including HTML, CSS, and JavaScript',
        timeLimit: 15,
        randomizeQuestions: true,
        isPublic: true,
        passingScore: 70,
        createdBy: '1', // Admin user
        createdAt: new Date('2023-12-15').toISOString(),
        updatedAt: new Date('2023-12-15').toISOString(),
        questions: [
          {
            id: '101',
            type: 'multiple',
            text: 'What does HTML stand for?',
            points: 1,
            required: true,
            options: [
              { id: '1001', text: 'Hyper Text Markup Language', isCorrect: true },
              { id: '1002', text: 'Hyper Transfer Markup Language', isCorrect: false },
              { id: '1003', text: 'Hyper Text Makeup Language', isCorrect: false },
              { id: '1004', text: 'High Tech Markup Language', isCorrect: false }
            ]
          },
          {
            id: '102',
            type: 'multiple',
            text: 'Which CSS property is used to change the text color?',
            points: 1,
            required: true,
            options: [
              { id: '1005', text: 'color', isCorrect: true },
              { id: '1006', text: 'text-color', isCorrect: false },
              { id: '1007', text: 'font-color', isCorrect: false },
              { id: '1008', text: 'text-style', isCorrect: false }
            ]
          },
          {
            id: '103',
            type: 'checkbox',
            text: 'Which of the following are JavaScript frameworks/libraries?',
            points: 2,
            required: true,
            options: [
              { id: '1009', text: 'React', isCorrect: true },
              { id: '1010', text: 'Angular', isCorrect: true },
              { id: '1011', text: 'Vue', isCorrect: true },
              { id: '1012', text: 'HTML5', isCorrect: false }
            ]
          },
          {
            id: '104',
            type: 'true-false',
            text: 'CSS is used for adding functionality to web pages.',
            points: 1,
            required: true,
            options: [
              { id: '1013', text: 'True', isCorrect: false },
              { id: '1014', text: 'False', isCorrect: true }
            ]
          },
          {
            id: '105',
            type: 'multiple',
            text: 'Which tag is used to define an unordered list in HTML?',
            points: 1,
            required: true,
            options: [
              { id: '1015', text: '<ul>', isCorrect: true },
              { id: '1016', text: '<ol>', isCorrect: false },
              { id: '1017', text: '<li>', isCorrect: false },
              { id: '1018', text: '<list>', isCorrect: false }
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'JavaScript Fundamentals',
        description: 'A quiz to test your understanding of JavaScript fundamentals',
        timeLimit: 10,
        randomizeQuestions: false,
        isPublic: true,
        passingScore: 80,
        createdBy: '2', // Test user
        createdAt: new Date('2023-12-18').toISOString(),
        updatedAt: new Date('2023-12-20').toISOString(),
        questions: [
          {
            id: '201',
            type: 'multiple',
            text: 'Which keyword is used to declare a variable in JavaScript?',
            points: 1,
            required: true,
            options: [
              { id: '2001', text: 'var', isCorrect: false },
              { id: '2002', text: 'let', isCorrect: false },
              { id: '2003', text: 'const', isCorrect: false },
              { id: '2004', text: 'All of the above', isCorrect: true }
            ]
          },
          {
            id: '202',
            type: 'multiple',
            text: 'What is the correct way to check if two variables are equal in value and type?',
            points: 1,
            required: true,
            options: [
              { id: '2005', text: '==', isCorrect: false },
              { id: '2006', text: '===', isCorrect: true },
              { id: '2007', text: '=', isCorrect: false },
              { id: '2008', text: '.equals()', isCorrect: false }
            ]
          },
          {
            id: '203',
            type: 'checkbox',
            text: 'Which of the following are valid ways to create an object in JavaScript?',
            points: 2,
            required: true,
            options: [
              { id: '2009', text: 'Object literal: {}', isCorrect: true },
              { id: '2010', text: 'new Object()', isCorrect: true },
              { id: '2011', text: 'Object.create()', isCorrect: true },
              { id: '2012', text: 'new Array()', isCorrect: false }
            ]
          }
        ]
      },
      {
        id: '3',
        title: 'General Knowledge',
        description: 'Test your general knowledge with this fun quiz',
        timeLimit: 5,
        randomizeQuestions: true,
        isPublic: true,
        passingScore: 60,
        createdBy: '1', // Admin user
        createdAt: new Date('2023-12-25').toISOString(),
        updatedAt: new Date('2023-12-25').toISOString(),
        questions: [
          {
            id: '301',
            type: 'multiple',
            text: 'Which planet is known as the Red Planet?',
            points: 1,
            required: true,
            options: [
              { id: '3001', text: 'Venus', isCorrect: false },
              { id: '3002', text: 'Mars', isCorrect: true },
              { id: '3003', text: 'Jupiter', isCorrect: false },
              { id: '3004', text: 'Saturn', isCorrect: false }
            ]
          },
          {
            id: '302',
            type: 'multiple',
            text: 'What is the capital of France?',
            points: 1,
            required: true,
            options: [
              { id: '3005', text: 'London', isCorrect: false },
              { id: '3006', text: 'Berlin', isCorrect: false },
              { id: '3007', text: 'Paris', isCorrect: true },
              { id: '3008', text: 'Rome', isCorrect: false }
            ]
          },
          {
            id: '303',
            type: 'true-false',
            text: 'The Great Wall of China is visible from space.',
            points: 1,
            required: true,
            options: [
              { id: '3009', text: 'True', isCorrect: false },
              { id: '3010', text: 'False', isCorrect: true }
            ]
          }
        ]
      }
    ];
    
    saveQuizzes(sampleQuizzes);
    
    // Create some sample attempts
    const sampleAttempts = generateSampleAttempts(sampleQuizzes);
    saveAttempts(sampleAttempts);
  }
};

// Generate sample quiz attempts for demo purposes
const generateSampleAttempts = (quizzes) => {
  const attempts = [];
  const users = [
    { id: '1', name: 'Admin User' },
    { id: '2', name: 'Test User' },
    { id: '3', name: 'John Doe' },
    { id: '4', name: 'Jane Smith' },
    { id: '5', name: 'Bob Johnson' }
  ];
  
  // Generate 50 random attempts across all quizzes
  for (let i = 0; i < 50; i++) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Generate random answers
    const answers = {};
    quiz.questions.forEach(question => {
      if (question.type === 'checkbox') {
        // For checkbox questions, randomly select 0-3 options
        const selectedOptions = [];
        const numOptions = Math.floor(Math.random() * 4);
        
        for (let j = 0; j < numOptions; j++) {
          const option = question.options[Math.floor(Math.random() * question.options.length)];
          if (!selectedOptions.includes(option.text)) {
            selectedOptions.push(option.text);
          }
        }
        
        answers[question.id] = selectedOptions;
      } else {
        // For radio/true-false questions, select a random option
        const option = question.options[Math.floor(Math.random() * question.options.length)];
        answers[question.id] = option.text;
      }
    });
    
    // Calculate score
    let correctAnswers = 0;
    
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      let isCorrect = false;
      
      if (question.type === 'checkbox') {
        // For multiple answer questions
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text);
        
        const userSelectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
        
        isCorrect = 
          correctOptions.length === userSelectedOptions.length &&
          correctOptions.every(opt => userSelectedOptions.includes(opt));
      } else {
        // For single answer questions
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && userAnswer === correctOption.text;
      }
      
      if (isCorrect) {
        correctAnswers += 1;
      }
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    // Generate a random date within the last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Generate a random time taken
    const timeTaken = quiz.timeLimit 
      ? Math.floor(Math.random() * quiz.timeLimit * 60) 
      : Math.floor(Math.random() * 600 + 60); // 1-10 minutes
    
    attempts.push({
      id: `attempt-${i + 1}`,
      quizId: quiz.id,
      userId: user.id,
      userName: user.name,
      answers,
      score,
      passed,
      timeTaken,
      attemptDate: date.toISOString()
    });
  }
  
  return attempts;
};

// Initialize on import
initializeQuizService();