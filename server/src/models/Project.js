const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  repositoryUrl: { type: String, default: '' },
  language: { type: String, default: '' },
  buildSystem: { type: String, default: '' },
  moduleCount: { type: Number, default: 0 },
  dependencyCount: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
