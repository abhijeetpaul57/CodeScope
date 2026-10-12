const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  changedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  affectedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  directlyAffectedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  transitivelyAffectedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  buildOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  cycleDetected: { type: Boolean, default: false },
  cycles: [[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }]],
  totalModules: { type: Number, default: 0 },
  affectedCount: { type: Number, default: 0 },
  rebuildReductionPercent: { type: Number, default: 0 },
  analysisTimeMs: { type: Number, default: 0 },
  algorithm: { type: String, default: 'BFS' },
}, {
  timestamps: true,
});

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
