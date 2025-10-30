// github-oauth-backend/models/User.js
// User schema used by OAuth backend. Adjust fields as needed.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // empty for OAuth-only
  role: { type: String, enum: ['user', 'developer', 'admin'], default: 'user' },
  token: { type: Number, default: 3 }, // remaining deploy tokens
  maxTokens: { type: Number, default: 3 },
  githubId: { type: String, unique: true, sparse: true },
  githubAccessToken: { type: String },
  avatarUrl: { type: String },
  githubProfile: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);