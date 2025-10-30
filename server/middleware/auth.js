const jwt = require('jsonwebtoken');
const config = require('../config'); // Create a config file for JWT secret
// Example Node.js/Express middleware for token verification

const authMiddleware = (req, res, next) => {
  // Get token from header (same as before)
  let token;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } 
  else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret);
    
    // Add user from payload - handle different token structures
    if (decoded.user) {
      req.user = decoded.user;
    } else if (decoded.id) {
      // If token contains direct user id
      req.user = { id: decoded.id };
    } else {
      // Fallback - use the entire decoded object
      req.user = decoded;
    }
    
    console.log('Authenticated user:', req.user); // Debugging
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;