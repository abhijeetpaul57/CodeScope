const mongoose = require('mongoose');

const buildPlanSchema = new mongoose.Schema({
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
  strategy: { type: String, default: 'codescope-incremental' },
  steps: [{
    order: { type: Number },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    },
    reason: { type: String },
    dependenciesSatisfied: { type: Boolean, default: true },
  }],
  totalModules: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
  estimatedBuildTimeMs: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const BuildPlan = mongoose.model('BuildPlan', buildPlanSchema);
module.exports = BuildPlan;
