const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  getModules,
  getModuleById,
  createModule,
  deleteModule,
} = require('../controllers/moduleController');

// Routes mounted at /api/projects/:projectId/modules and /api/modules
router.route('/').get(protect, getModules).post(protect, createModule);
router.route('/:id').get(protect, getModuleById).delete(protect, deleteModule);

module.exports = router;
