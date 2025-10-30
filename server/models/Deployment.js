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
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'building', 'live', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  logs: [
    {
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      level: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
      }
    }
  ]
});

module.exports = mongoose.model('Deployment', deploymentSchema);