const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const Module = require('../models/Module');
const Dependency = require('../models/Dependency');
const { analyzeImpact } = require('../services/engineService');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const analyze = async (req, res) => {
  try {
    const { changedModules } = req.body; // array of module IDs
    if (!changedModules || changedModules.length === 0) {
      return res.status(400).json({ message: 'No changed modules provided' });
    }

    const projectId = req.params.projectId;

    let modules = [];
    let dependencies = [];

    if (isDbConnected()) {
      modules = await Module.find({ projectId });
      dependencies = await Dependency.find({ projectId });
    } else {
      modules = await fallbackStore.getModules(projectId);
      dependencies = await fallbackStore.getDependencies(projectId);
    }

    const graphData = {
      modules: modules.map((m) => m._id.toString()),
      dependencies: dependencies.map((d) => [d.sourceModuleId.toString(), d.targetModuleId.toString()]),
      changedModules: changedModules.map((id) => id.toString()),
    };

    const startTime = process.hrtime.bigint();

    // Call C++ engine via service
    const engineResult = await analyzeImpact(graphData);

    const endTime = process.hrtime.bigint();
    const analysisTimeMs = Number(endTime - startTime) / 1000000.0;

    const affectedCount = engineResult.affectedModules.length;
    const totalModules = modules.length;
    const rebuildReductionPercent = totalModules > 0 
      ? ((totalModules - affectedCount) / totalModules) * 100 
      : 0;

    const analysisPayload = {
      projectId,
      changedModules,
      affectedModules: engineResult.affectedModules,
      buildOrder: engineResult.buildOrder,
      cycleDetected: engineResult.cycleDetected,
      cycles: engineResult.cycles,
      totalModules,
      affectedCount,
      rebuildReductionPercent,
      analysisTimeMs,
    };

    if (isDbConnected()) {
      const analysis = await Analysis.create(analysisPayload);
      return res.status(201).json(analysis);
    } else {
      const analysis = await fallbackStore.createAnalysis(analysisPayload);
      return res.status(201).json(analysis);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ message: error.message });
  }
};

const getAnalyses = async (req, res) => {
  try {
    if (isDbConnected()) {
      const analyses = await Analysis.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
      return res.json(analyses);
    } else {
      const analyses = await fallbackStore.getAnalyses(req.params.projectId);
      return res.json(analyses);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    if (isDbConnected()) {
      const analysis = await Analysis.findById(req.params.id)
        .populate('changedModules', 'name path type')
        .populate('affectedModules', 'name path type')
        .populate('buildOrder', 'name path type');
      if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
      return res.json(analysis);
    } else {
      const analyses = await fallbackStore.getAnalyses(req.params.id || '');
      return res.json(analyses[0] || {});
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  analyze,
  getAnalyses,
  getAnalysisById,
};
