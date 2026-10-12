const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { analyze, getAnalyses, getAnalysisById } = require('../controllers/analysisController');

// Routes mapped to /api/projects/:projectId/analysis and /api/analysis/:id
router.route('/').get(protect, getAnalyses).post(protect, analyze);
router.route('/:id').get(protect, getAnalysisById);

module.exports = router;
