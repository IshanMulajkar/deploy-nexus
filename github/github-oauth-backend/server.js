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
  token: {
    type: Number,
    default: 3  // Default deployment tokens
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('User', userSchema);

// Updated Deployment Schema with logs field
const deploymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  repoName: {
    type: String,
    required: true
  },
  deployUrl: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['deploying', 'live', 'failed', 'stopped'],
    default: 'deploying'
  },
  framework: {
    type: String
  },
  buildCommand: {
    type: String
  },
  outputDirectory: {
    type: String
  },
  branch: {
    type: String,
    default: 'main'
  },
  mainFilePath: {
    type: String
  },
  pythonVersion: {
    type: String
  },
  environmentVariables: {
    type: Map,
    of: String
  },
  logs: {
    type: Array,
    default: []  // Add logs field as an empty array
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deployedAt: {
    type: Date
  }
});

const Deployment = mongoose.model('Deployment', deploymentSchema);

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
        role: 'developer',
        token: 3  // Give 3 free deployment tokens
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
        githubProfile: user.githubProfile,
        token: user.token
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
      role,
      token: 3  // Give 3 free deployment tokens
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
        role: newUser.role,
        token: newUser.token
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
        role: user.role,
        token: user.token
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

// ============ DEPLOYMENT ROUTES ============

// Get user token info
app.get('/api/tokens/info', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('token');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({
      tokens: user.token || 0,
      maxTokens: 3
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create new deployment
app.post('/api/deploy', authenticateToken, async (req, res) => {
  try {
    const { 
      repoUrl, 
      repository,
      branch,
      mainFilePath,
      appUrl,
      pythonVersion,
      framework, 
      buildCommand, 
      outputDirectory, 
      environmentVariables,
      secrets,
      customUrl
    } = req.body;
    
    console.log('Received deployment request:', req.body);
    
    // Validate required fields - support both formats
    const finalRepoUrl = repoUrl || (repository ? `https://github.com/${repository}.git` : null);
    
    if (!finalRepoUrl) {
      return res.status(400).json({ message: 'Repository URL or repository name is required' });
    }
    
    // Check user tokens
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.token <= 0) {
      return res.status(400).json({ message: 'No deployment tokens available' });
    }
    
    // Extract repo name from URL or use repository field
    let repoName;
    if (repository) {
      repoName = repository.split('/').pop();
    } else {
      repoName = finalRepoUrl.split('/').pop().replace('.git', '');
    }
    
    // Generate deployment URL (use custom or appUrl or random)
    let deployUrl;
    if (customUrl) {
      deployUrl = customUrl;
    } else if (appUrl) {
      deployUrl = `https://${appUrl}.deploynexus.app`;
    } else {
      const randomStr = Math.random().toString(36).substring(2, 8);
      deployUrl = `https://${randomStr}.deploynexus.app`;
    }
    
    // Parse environment variables/secrets
    let envVars = {};
    if (secrets) {
      try {
        envVars = typeof secrets === 'string' ? JSON.parse(secrets) : secrets;
      } catch (err) {
        console.log('Failed to parse secrets, using as-is');
        envVars = { secrets: secrets };
      }
    } else if (environmentVariables) {
      envVars = environmentVariables;
    }
    
    // Create new deployment record with all information
    const deployment = new Deployment({
      user: req.user.userId,
      repoUrl: finalRepoUrl,
      repoName,
      deployUrl,
      branch: branch || 'main',
      mainFilePath: mainFilePath || '',
      pythonVersion: pythonVersion || '3.13',
      framework: framework || pythonVersion ? 'python' : 'static',
      buildCommand: buildCommand || '',
      outputDirectory: outputDirectory || 'dist',
      environmentVariables: envVars,
      logs: [],
      status: 'deploying',
      createdAt: new Date()
    });
    
    console.log('Creating deployment:', deployment);
    
    // Save deployment to MongoDB
    await deployment.save();
    
    console.log('✅ Deployment saved to database:', deployment._id);
    
    // Decrement user tokens
    user.token -= 1;
    await user.save();
    
    console.log(`User tokens decremented. Remaining: ${user.token}`);
    
    // Simulate deployment process (3 seconds)
    setTimeout(async () => {
      try {
        deployment.status = 'live';
        deployment.deployedAt = new Date();
        deployment.logs.push({
          timestamp: new Date(),
          message: 'Deployment completed successfully',
          level: 'info'
        });
        await deployment.save();
        console.log(`✅ Deployment ${deployment._id} is now live at ${deployUrl}`);
      } catch (err) {
        console.error('Error updating deployment status:', err);
      }
    }, 3000);
    
    return res.json({
      success: true,
      message: 'Deployment started successfully',
      deployUrl,
      remainingTokens: user.token,
      deployment: {
        id: deployment._id,
        repoUrl: deployment.repoUrl,
        repoName: deployment.repoName,
        deployUrl: deployment.deployUrl,
        branch: deployment.branch,
        mainFilePath: deployment.mainFilePath,
        pythonVersion: deployment.pythonVersion,
        framework: deployment.framework,
        buildCommand: deployment.buildCommand,
        outputDirectory: deployment.outputDirectory,
        status: deployment.status,
        createdAt: deployment.createdAt,
        logs: deployment.logs
      }
    });
  } catch (error) {
    console.error('Error deploying project:', error);
    return res.status(500).json({ 
      message: 'Deployment failed. Please try again.',
      error: error.message 
    });
  }
});

// Get all user deployments
app.get('/api/deployments', authenticateToken, async (req, res) => {
  try {
    const deployments = await Deployment.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return res.json({ 
      success: true,
      deployments 
    });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get single deployment by ID
app.get('/api/deployments/:id', authenticateToken, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    
    return res.json({ 
      success: true,
      deployment 
    });
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete deployment
app.delete('/api/deployments/:id', authenticateToken, async (req, res) => {
  try {
    const deployment = await Deployment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    
    return res.json({ 
      success: true,
      message: 'Deployment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting deployment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add tokens to user account (admin or payment feature)
app.post('/api/tokens/add', authenticateToken, async (req, res) => {
  try {
    const { count } = req.body;
    
    if (!count || count <= 0) {
      return res.status(400).json({ message: 'Invalid token count' });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.token = (user.token || 0) + count;
    await user.save();
    
    return res.json({
      success: true,
      tokens: user.token,
      message: `${count} tokens added successfully`
    });
  } catch (error) {
    console.error('Error adding tokens:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));