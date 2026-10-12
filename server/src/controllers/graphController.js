const mongoose = require('mongoose');
const Module = require('../models/Module');
const Dependency = require('../models/Dependency');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getGraph = async (req, res) => {
  try {
    if (isDbConnected()) {
      const modules = await Module.find({ projectId: req.params.projectId });
      const dependencies = await Dependency.find({ projectId: req.params.projectId });

      return res.json({
        nodes: modules.map((m) => ({ id: m._id, label: m.name, type: m.type })),
        edges: dependencies.map((d) => ({ source: d.sourceModuleId, target: d.targetModuleId })),
      });
    } else {
      const graph = await fallbackStore.getGraph(req.params.projectId);
      return res.json(graph);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGraph,
};
