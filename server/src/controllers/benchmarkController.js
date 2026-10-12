const Benchmark = require('../models/Benchmark');
const Analysis = require('../models/Analysis');

const runBenchmark = async (req, res) => {
  try {
    const { analysisId } = req.body;
    const analysis = await Analysis.findById(analysisId);
    
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    // Simulate Build Benchmarks
    const baselineBuildMs = analysis.totalModules * 500; // 500ms per module
    const optimizedBuildMs = analysis.affectedCount * 500;

    const buildTimeReductionPercent = baselineBuildMs > 0 
      ? ((baselineBuildMs - optimizedBuildMs) / baselineBuildMs) * 100 
      : 0;

    const benchmark = await Benchmark.create({
      projectId: req.params.projectId,
      analysisId,
      baseline: {
        strategy: 'full',
        modulesBuilt: analysis.totalModules,
        buildTimeMs: baselineBuildMs,
      },
      optimized: {
        strategy: 'codescope-incremental',
        modulesBuilt: analysis.affectedCount,
        buildTimeMs: optimizedBuildMs,
      },
      metrics: {
        moduleReductionPercent: analysis.rebuildReductionPercent,
        buildTimeReductionPercent,
        analysisTimeMs: analysis.analysisTimeMs,
      },
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
      },
    });

    res.status(201).json(benchmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBenchmarks = async (req, res) => {
  try {
    const benchmarks = await Benchmark.find({ projectId: req.params.projectId })
      .populate('analysisId')
      .sort({ createdAt: -1 });
    res.json(benchmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { runBenchmark, getBenchmarks };
