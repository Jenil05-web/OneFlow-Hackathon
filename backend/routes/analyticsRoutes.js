// backend/routes/analyticsRoutes.js
import express from "express";
import Project from "../models/Project.js";
import Timesheet from "../models/Timesheet.js";
import Invoice from "../models/Invoice.js";
import VendorBill from "../models/VendorBill.js";
import Expense from "../models/Expense.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 📊 ANALYTICS ROUTES
 * Role-based:
 *  - Admin: all projects and finances
 *  - Manager: only their projects
 */

/**
 * @route   GET /api/analytics/financial-summary
 * @desc    Get overall revenue, cost, and profit trends
 * @access  Admin, Manager
 */
router.get("/financial-summary", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    let projectFilter = {};

    if (req.user.role === "Manager") {
      projectFilter.manager = req.user._id;
    }

    // Aggregate project profitability
    const projects = await Project.find(projectFilter).select("name revenue cost");

    const summary = projects.map((p) => ({
      project: p.name,
      revenue: p.revenue || 0,
      cost: p.cost || 0,
      profit: (p.revenue || 0) - (p.cost || 0),
    }));

    // Totals for all visible projects
    const totals = summary.reduce(
      (acc, p) => {
        acc.revenue += p.revenue;
        acc.cost += p.cost;
        acc.profit += p.profit;
        return acc;
      },
      { revenue: 0, cost: 0, profit: 0 }
    );

    res.json({ success: true, totals, summary });
  } catch (error) {
    console.error("❌ Financial Summary Error:", error.message);
    res.status(500).json({ success: false, message: "Server error generating summary" });
  }
});

/**
 * @route   GET /api/analytics/time-utilization
 * @desc    Get user or team time utilization stats (hours per project)
 * @access  Admin, Manager
 */
router.get("/time-utilization", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const matchQuery =
      req.user.role === "Manager"
        ? { project: { $in: await Project.distinct("_id", { manager: req.user._id }) } }
        : {};

    const utilization = await Timesheet.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$project",
          totalHours: { $sum: "$hours" },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          projectName: "$project.name",
          totalHours: 1,
        },
      },
    ]);

    res.json({ success: true, utilization });
  } catch (error) {
    console.error("❌ Time Utilization Error:", error.message);
    res.status(500).json({ success: false, message: "Server error generating utilization data" });
  }
});

/**
 * @route   GET /api/analytics/revenue-trend
 * @desc    Get monthly revenue & cost trends for chart display
 * @access  Admin
 */
router.get("/revenue-trend", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    // Revenue from invoices by month
    const revenueTrend = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Costs from vendor bills by month
    const costTrend = await VendorBill.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalCost: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const formatted = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const revenue = revenueTrend.find((r) => r._id === month)?.totalRevenue || 0;
      const cost = costTrend.find((c) => c._id === month)?.totalCost || 0;
      return {
        month,
        revenue,
        cost,
        profit: revenue - cost,
      };
    });

    res.json({ success: true, trend: formatted });
  } catch (error) {
    console.error("❌ Revenue Trend Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching revenue trend" });
  }
});

/**
 * @route   GET /api/analytics/expense-breakdown
 * @desc    Get categorized expense data for pie charts
 * @access  Admin, Manager
 */
router.get("/expense-breakdown", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const matchQuery =
      req.user.role === "Manager"
        ? { project: { $in: await Project.distinct("_id", { manager: req.user._id }) } }
        : {};

    const breakdown = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, breakdown });
  } catch (error) {
    console.error("❌ Expense Breakdown Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching expense breakdown" });
  }
});

/**
 * @route   GET /api/analytics/project-performance
 * @desc    Compare project profit margins for bar chart
 * @access  Admin, Manager
 */
router.get("/project-performance", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const filter = req.user.role === "Manager" ? { manager: req.user._id } : {};

    const projects = await Project.find(filter).select("name revenue cost");

    const performance = projects.map((p) => ({
      project: p.name,
      revenue: p.revenue || 0,
      cost: p.cost || 0,
      profitMargin: p.revenue ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
    }));

    res.json({ success: true, performance });
  } catch (error) {
    console.error("❌ Project Performance Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching project performance" });
  }
});

export default router;
