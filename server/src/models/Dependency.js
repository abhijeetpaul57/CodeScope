const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sourceModuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  targetModuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  dependencyType: { type: String, default: 'direct' },
  metadata: { type: Object, default: {} },
}, {
  timestamps: true,
});

dependencySchema.index({ projectId: 1, sourceModuleId: 1 });
dependencySchema.index({ projectId: 1, targetModuleId: 1 });
dependencySchema.index({ sourceModuleId: 1, targetModuleId: 1 }, { unique: true });

const Dependency = mongoose.model('Dependency', dependencySchema);
module.exports = Dependency;
