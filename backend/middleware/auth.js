// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if no token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Verify token
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizappsecret');
    
    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};