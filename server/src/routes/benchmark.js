const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { runBenchmark, getBenchmarks } = require('../controllers/benchmarkController');

// /api/projects/:projectId/benchmarks
router.route('/').get(protect, getBenchmarks).post(protect, runBenchmark);

module.exports = router;
