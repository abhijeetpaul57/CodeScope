const BuildPlan = require('../models/BuildPlan');
const Analysis = require('../models/Analysis');

const generateBuildPlan = async (req, res) => {
  try {
    const { analysisId } = req.body;
    const analysis = await Analysis.findById(analysisId).populate('buildOrder', 'name');
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    if (analysis.cycleDetected) {
      return res.status(400).json({ message: 'Cannot generate valid build plan with cycles' });
    }

    const steps = analysis.buildOrder.map((mod, index) => ({
      order: index + 1,
      moduleId: mod._id,
      reason: analysis.changedModules.includes(mod._id) ? 'Changed directly' : 'Transitive dependency',
      dependenciesSatisfied: true, // assumed satisfied due to topo sort
    }));

    const buildPlan = await BuildPlan.create({
      projectId: req.params.projectId,
      analysisId,
      strategy: 'codescope-incremental',
      steps,
      totalModules: analysis.totalModules,
      totalSteps: steps.length,
      estimatedBuildTimeMs: steps.length * 500, // mock 500ms per module
    });

    res.status(201).json(buildPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuildPlanByAnalysisId = async (req, res) => {
  try {
    const plan = await BuildPlan.findOne({ analysisId: req.params.analysisId })
      .populate('steps.moduleId', 'name path type');
    if (!plan) return res.status(404).json({ message: 'Build plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateBuildPlan,
  getBuildPlanByAnalysisId,
};
