const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  seedDemoProject,
  seedFinanceDemoProject,
} = require('../controllers/projectController');

router.post('/seed', protect, seedDemoProject);
router.post('/seed-finance', protect, seedFinanceDemoProject);
router.route('/').get(protect, getProjects).post(protect, createProject);
router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
