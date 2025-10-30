// github-oauth-backend/middleware/auth.js
// Auth middleware to validate JWT tokens passed as "Bearer <token>" or in x-auth-token header.

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Check Authorization header
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    }
  }

  // Fallback to x-auth-token header
  if (!token) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message || err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};