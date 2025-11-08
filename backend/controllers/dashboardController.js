const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user.id });
  res.json(projects);
});

// @desc    Get KPI data
// @route   GET /api/kpi
// @access  Private
const getKpiData = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user.id });
  
  const kpiData = {
    activeProjects: projects.filter(p => p.status === 'in-progress').length,
    delayedTasks: projects.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate < new Date() && p.status !== 'completed';
    }).length,
    hoursLogged: projects.reduce((total, p) => total + (p.hoursLogged || 0), 0),
    revenueEarned: projects.reduce((total, p) => total + (p.revenue || 0), 0)
  };

  res.json(kpiData);
});

module.exports = {
  getProjects,
  getKpiData
};