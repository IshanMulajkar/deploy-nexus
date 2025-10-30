/**
 * Deployment model saved explicitly to the "deployment" collection.
 * This model includes the fields you requested (repoName, deployUrl, status, createdAt)
 * plus logs (array) and other deployment metadata.
 */
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
  logs: {
    type: [String],
    default: []
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
}, {
  collection: 'deployment' // force collection name to "deployment"
});

module.exports = mongoose.model('Deployment', deploymentSchema);