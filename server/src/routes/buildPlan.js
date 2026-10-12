const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { generateBuildPlan, getBuildPlanByAnalysisId } = require('../controllers/buildPlanController');

router.post('/', protect, generateBuildPlan); // /api/projects/:projectId/build-plan
router.get('/analysis/:analysisId', protect, getBuildPlanByAnalysisId); // /api/build-plan/analysis/:analysisId

module.exports = router;
