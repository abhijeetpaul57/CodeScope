const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { getGraph } = require('../controllers/graphController');

router.route('/').get(protect, getGraph);

module.exports = router;
