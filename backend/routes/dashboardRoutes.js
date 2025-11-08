const express = require('express');
const router = express.Router();
const { getProjects, getKpiData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/projects', protect, getProjects);
router.get('/kpi', protect, getKpiData);

module.exports = router;