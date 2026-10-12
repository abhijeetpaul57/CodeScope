const mongoose = require('mongoose');

const benchmarkSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true,
  },
  baseline: {
    strategy: { type: String, default: 'full' },
    modulesBuilt: { type: Number, default: 0 },
    buildTimeMs: { type: Number, default: 0 },
  },
  optimized: {
    strategy: { type: String, default: 'codescope-incremental' },
    modulesBuilt: { type: Number, default: 0 },
    buildTimeMs: { type: Number, default: 0 },
  },
  metrics: {
    moduleReductionPercent: { type: Number, default: 0 },
    buildTimeReductionPercent: { type: Number, default: 0 },
    analysisTimeMs: { type: Number, default: 0 },
  },
  environment: {
    platform: { type: String, default: 'unknown' },
    nodeVersion: { type: String, default: 'unknown' },
  },
}, {
  timestamps: true,
});

const Benchmark = mongoose.model('Benchmark', benchmarkSchema);
module.exports = Benchmark;
