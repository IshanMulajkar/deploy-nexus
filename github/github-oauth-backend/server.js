const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema & Model (Updated for GitHub)
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: false // Not required for GitHub OAuth users
  },
  role: { 
    type: String, 
    enum: ['user', 'developer', 'admin'], 
    default: 'user' 
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  githubAccessToken: {
    type: String
  },
  avatarUrl: {
    type: String
  },
  githubProfile: {
    type: Object
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('User', userSchema);

// GitHub OAuth Configuration
const GITHUB_CLIENT_ID = 'Ov23lisFSFQTH0D7WEHm';
const GITHUB_CLIENT_SECRET = '7b5cf7a88b58403038208e36a335c1eefa50cee5';
const GITHUB_CALLBACK_URL = 'http://localhost:3000/auth/github/callback';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============ GITHUB OAUTH ROUTES ============

// Step 1: Redirect to GitHub for authentication
app.get('/api/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=user,repo`;
  res.json({ url: githubAuthUrl });
});

// Step 2: GitHub callback - Exchange code for access token
app.post('/api/auth/github/callback', async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_CALLBACK_URL
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const githubUser = userResponse.data;

    // Check if user exists in database
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      // Create new user
      user = new User({
        username: githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.com`,
        githubId: githubUser.id.toString(),
        githubAccessToken: accessToken,
        avatarUrl: githubUser.avatar_url,
        githubProfile: githubUser,
        role: 'developer'
      });
      await user.save();
    } else {
      // Update existing user
      user.githubAccessToken = accessToken;
      user.avatarUrl = githubUser.avatar_url;
      user.githubProfile = githubUser;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, githubId: user.githubId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'GitHub authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        githubProfile: user.githubProfile
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'GitHub authentication failed',
      error: error.response?.data || error.message 
    });
  }
});

// Get user's GitHub repositories
app.get('/api/github/repos', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.githubAccessToken) {
      return res.status(401).json({ message: 'GitHub not connected' });
    }

    // Fetch repositories from GitHub
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    res.json({
      repos: reposResponse.data
    });
  } catch (error) {
    console.error('Fetch repos error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to fetch repositories',
      error: error.response?.data || error.message 
    });
  }
});

// ============ ORIGINAL AUTHENTICATION ROUTES ============

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -githubAccessToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));