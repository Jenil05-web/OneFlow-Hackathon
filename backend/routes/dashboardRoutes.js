// backend/routes/dashboardRoutes.js
import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Timesheet from "../models/Timesheet.js";
import Invoice from "../models/Invoice.js";
import VendorBill from "../models/VendorBill.js";
import Expense from "../models/Expense.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧭 Dashboard Routes
 * Returns analytics data customized by user role.
 *
 * - Admin: full system stats
 * - Manager: their projects & team overview
 * - Team: personal performance overview
 */

/**
 * @route   GET /api/dashboard
 * @desc    Get role-based dashboard summary
 * @access  Authenticated users
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const role = req.user.role;
    let data = {};

    // ===============================
    // 🟢 ADMIN DASHBOARD
    // ===============================
    if (role === "Admin") {
      const [projectCount, taskCount, timesheetCount, totalRevenue, totalCost, expenseSum] =
        await Promise.all([
          Project.countDocuments(),
          Task.countDocuments(),
          Timesheet.countDocuments(),
          Invoice.aggregate([{ $group: { _id: null, sum: { $sum: "$total" } } }]),
          VendorBill.aggregate([{ $group: { _id: null, sum: { $sum: "$total" } } }]),
          Expense.aggregate([{ $group: { _id: null, sum: { $sum: "$amount" } } }]),
        ]);

      const revenue = totalRevenue[0]?.sum || 0;
      const cost = totalCost[0]?.sum || 0;
      const expenses = expenseSum[0]?.sum || 0;
      const profit = revenue - (cost + expenses);

      data = {
        role: "Admin",
        summary: {
          totalProjects: projectCount,
          totalTasks: taskCount,
          totalTimesheets: timesheetCount,
          totalRevenue: revenue,
          totalCost: cost,
          totalExpenses: expenses,
          totalProfit: profit,
        },
        breakdown: {
          revenueByProject: await Project.aggregate([
            {
              $lookup: {
                from: "invoices",
                localField: "_id",
                foreignField: "project",
                as: "invoices",
              },
            },
            {
              $project: {
                name: 1,
                revenue: { $sum: "$invoices.total" },
              },
            },
          ]),
        },
      };
    }

    // ===============================
    // 🟣 MANAGER DASHBOARD
    // ===============================
    else if (role === "Manager") {
      const projects = await Project.find({ manager: req.user._id }).populate("members", "name role");
      const projectIds = projects.map((p) => p._id);

      const [taskCount, teamMembers, totalHours, totalRevenue, totalCost] = await Promise.all([
        Task.countDocuments({ project: { $in: projectIds } }),
        Timesheet.distinct("user", { project: { $in: projectIds } }),
        Timesheet.aggregate([
          { $match: { project: { $in: projectIds } } },
          { $group: { _id: null, totalHours: { $sum: "$hours" } } },
        ]),
        Invoice.aggregate([
          { $match: { project: { $in: projectIds } } },
          { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
        ]),
        VendorBill.aggregate([
          { $match: { project: { $in: projectIds } } },
          { $group: { _id: null, totalCost: { $sum: "$total" } } },
        ]),
      ]);

      const revenue = totalRevenue[0]?.totalRevenue || 0;
      const cost = totalCost[0]?.totalCost || 0;
      const hours = totalHours[0]?.totalHours || 0;

      data = {
        role: "Manager",
        summary: {
          managedProjects: projects.length,
          totalTasks: taskCount,
          teamMembers: teamMembers.length,
          totalHours: hours,
          totalRevenue: revenue,
          totalCost: cost,
          profit: revenue - cost,
        },
        projects: projects.map((p) => ({
          id: p._id,
          name: p.name,
          status: p.status,
          members: p.members.length,
        })),
      };
    }

    // ===============================
    // 🟠 TEAM MEMBER DASHBOARD
    // ===============================
    else if (role === "Team") {
      const [assignedTasks, timesheets, totalHours, projectList] = await Promise.all([
        Task.find({ assignedTo: req.user._id }).populate("project", "name status"),
        Timesheet.find({ user: req.user._id }),
        Timesheet.aggregate([
          { $match: { user: req.user._id } },
          { $group: { _id: null, totalHours: { $sum: "$hours" } } },
        ]),
        Project.find({ $or: [{ members: req.user._id }, { teamMembers: req.user._id }] }).select("name status"),
      ]);

      data = {
        role: "Team",
        summary: {
          totalTasks: assignedTasks.length,
          totalProjects: projectList.length,
          totalTimesheets: timesheets.length,
          totalHours: totalHours[0]?.totalHours || 0,
        },
        tasks: assignedTasks.map((t) => ({
          id: t._id,
          title: t.title,
          project: t.project?.name,
          status: t.status,
        })),
      };
    }

    // ===============================
    // DEFAULT HANDLER
    // ===============================
    else {
      data = { message: "Invalid role or unauthorized access" };
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Dashboard Error:", error.message);
    res.status(500).json({ success: false, message: "Server error loading dashboard" });
  }
});

/**
 * @route   GET /api/dashboard/stats/project/:id
 * @desc    Get detailed stats for one project
 * @access  Manager/Admin
 */
router.get("/stats/project/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const projectId = req.params.id;

    const [project, taskCount, totalHours, revenue, cost, expenses] = await Promise.all([
      Project.findById(projectId).populate("manager", "name").populate("members", "name role"),
      Task.countDocuments({ project: projectId }),
      Timesheet.aggregate([
        { $match: { project: projectId } },
        { $group: { _id: null, totalHours: { $sum: "$hours" } } },
      ]),
      Invoice.aggregate([
        { $match: { project: projectId } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]),
      VendorBill.aggregate([
        { $match: { project: projectId } },
        { $group: { _id: null, totalCost: { $sum: "$total" } } },
      ]),
      Expense.aggregate([
        { $match: { project: projectId } },
        { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
      ]),
    ]);

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const revenueSum = revenue[0]?.totalRevenue || 0;
    const costSum = cost[0]?.totalCost || 0;
    const expenseSum = expenses[0]?.totalExpenses || 0;
    const profit = revenueSum - (costSum + expenseSum);

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        manager: project.manager?.name,
        members: project.members.length,
        status: project.status,
      },
      stats: {
        totalTasks: taskCount,
        totalHours: totalHours[0]?.totalHours || 0,
        revenue: revenueSum,
        cost: costSum,
        expenses: expenseSum,
        profit,
      },
    });
  } catch (error) {
    console.error("❌ Project Stats Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching project stats" });
  }
});

export default router;
