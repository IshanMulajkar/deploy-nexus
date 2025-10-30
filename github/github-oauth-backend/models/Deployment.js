const mongoose = require('mongoose');

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
  environmentVariables: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deployedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Deployment', deploymentSchema);