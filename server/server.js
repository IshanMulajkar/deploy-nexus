// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust path as needed
const Deployment = require('./models/Deployment'); // We'll create this model next
const auth = require('./middleware/auth'); // Middleware for authentication
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define User Schema
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
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'developer', 'admin'],
    default: 'user'
  },
  token: {
    type: Number,
    default: 3  // Default token value is 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
// const User = mongoose.model('User', userSchema);

// Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with default token value of 3
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      token: 3
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: user.token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and assign token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        token: user.token // Include token value in JWT
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: user.token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route example
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tokens/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('token');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Assuming "token" field in your schema represents remaining tokens
    return res.json({
      tokens: user.token,
      maxTokens: user.maxTokens || user.token // Use maxTokens if exists, otherwise use current tokens as max
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Use a token (decrement)
app.post('/api/tokens/use', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.token <= 0) {
      return res.status(400).json({ message: 'No tokens available' });
    }
    
    // Decrement token
    user.token -= 1;
    await user.save();
    
    return res.json({
      success: true, 
      tokens: user.token,
      maxTokens: user.maxTokens || user.token + 1 // Use maxTokens if exists, or calculate based on previous value
    });
  } catch (error) {
    console.error('Error using token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add tokens to user account
app.post('/api/tokens/add', auth, async (req, res) => {
  try {
    const { count } = req.body;
    
    if (!count || count <= 0) {
      return res.status(400).json({ message: 'Invalid token count' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add tokens
    user.token += count;
    
    // Update maxTokens if not set or new total is higher
    if (!user.maxTokens || user.token > user.maxTokens) {
      user.maxTokens = user.token;
    }
    
    await user.save();
    
    return res.json({
      tokens: user.token,
      maxTokens: user.maxTokens
    });
  } catch (error) {
    console.error('Error adding tokens:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// stopping here till now everything works smothelly just the deployment option is not working when clicked deploy project button geting this error 

/*DashboardPage.tsx:81 
 POST http://localhost:5000/api/deploy 500 (Internal Server Error)
DashboardPage.tsx:100 Deployment error: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
handleDeploy	@	DashboardPage.tsx:100
 */

// i will figure it out 8-49 10-5-25

// Deployment endpoint
app.post('/api/deploy', auth, async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ message: 'Repository URL is required' });
    }
    
    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop();
    
    // Generate a random subdomain
    const randomStr = Math.random().toString(36).substring(2, 8);
    const deployUrl = `https://${randomStr}.deploynexus.app`;
    
    // Create new deployment record
    const deployment = new Deployment({
      user: req.user.id,
      repoUrl,
      repoName,
      deployUrl,
      status: 'live', // Assuming immediate deployment for now
    });
    
    await deployment.save();
    
    return res.json({
      success: true,
      deployUrl,
      deployment
    });
  } catch (error) {
    console.error('Error deploying project:', error);
    return res.status(500).json({ message: 'Deployment failed. Please try again.' });
  }
});

// Get user deployments
app.get('/api/deployments', auth, async (req, res) => {
  try {
    const deployments = await Deployment.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(10); // Limit to 10 most recent
    
    return res.json({ deployments });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Update token count
app.put('/api/user/token', authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Token value is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { token: value },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));