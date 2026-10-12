const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  getDependencies,
  createDependency,
  deleteDependency,
} = require('../controllers/dependencyController');

router.route('/').get(protect, getDependencies).post(protect, createDependency);
router.route('/:id').delete(protect, deleteDependency);

module.exports = router;
