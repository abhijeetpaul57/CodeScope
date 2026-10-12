const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: { type: String, required: true },
  path: { type: String, default: '' },
  type: { type: String, default: '' },
  version: { type: String, default: '' },
  metadata: { type: Object, default: {} },
}, {
  timestamps: true,
});

moduleSchema.index({ projectId: 1, name: 1 }, { unique: true });

const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;
