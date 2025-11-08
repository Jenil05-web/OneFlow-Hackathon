// backend/routes/timesheetRoutes.js
import express from "express";
import Timesheet from "../models/Timesheet.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧠 Role-based rules:
 * - Admin / Manager → full CRUD, approve/reject timesheets
 * - Team Member → can log and edit their own timesheets only
 */

/**
 * @route   POST /api/timesheets
 * @desc    Create a new timesheet entry (Team, Manager, Admin)
 */
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { project, task, hours, date, description, billable } = req.body;

    if (!project || !hours || !date) {
      return res.status(400).json({
        success: false,
        message: "Project, hours, and date are required",
      });
    }

    // Validate project
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Validate task if provided
    if (task) {
      const taskExists = await Task.findById(task);
      if (!taskExists) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
    }

    // Create timesheet
    const timesheet = await Timesheet.create({
      project,
      task: task || undefined,
      user: req.user._id,
      hours,
      date,
      description: description || "",
      billable: billable !== undefined ? billable : true,
    });

    res.status(201).json({
      success: true,
      message: "Timesheet logged successfully",
      timesheet,
    });
  } catch (error) {
    console.error("❌ Create Timesheet Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating timesheet" });
  }
});

/**
 * @route   GET /api/timesheets
 * @desc    Get all timesheets (Team sees only their own)
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "Team") {
      query.user = req.user._id;
    }

    // Support project and task filters
    if (req.query.project) {
      query.project = req.query.project;
    }
    if (req.query.task) {
      query.task = req.query.task;
    }

    const timesheets = await Timesheet.find(query)
      .populate("project", "name")
      .populate("task", "title")
      .populate("user", "name email role")
      .populate("approvedBy", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: timesheets.length,
      timesheets,
    });
  } catch (error) {
    console.error("❌ Get Timesheets Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching timesheets" });
  }
});

/**
 * @route   GET /api/timesheets/:id
 * @desc    Get single timesheet details
 */
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate("project", "name")
      .populate("task", "title")
      .populate("user", "name email role");

    if (!timesheet) {
      return res.status(404).json({ success: false, message: "Timesheet not found" });
    }

    if (req.user.role === "Team" && String(timesheet.user._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, timesheet });
  } catch (error) {
    console.error("❌ Get Timesheet Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching timesheet" });
  }
});

/**
 * @route   PUT /api/timesheets/:id
 * @desc    Update a timesheet (Owner, Admin, or Manager)
 */
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ success: false, message: "Timesheet not found" });
    }

    // Only owner or admin/manager can edit
    if (
      req.user.role === "Team" &&
      String(timesheet.user._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    Object.assign(timesheet, updates);
    await timesheet.save();

    res.json({
      success: true,
      message: "Timesheet updated successfully",
      timesheet,
    });
  } catch (error) {
    console.error("❌ Update Timesheet Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating timesheet" });
  }
});

/**
 * @route   PUT /api/timesheets/:id/status
 * @desc    Approve or reject a timesheet (Admin / Manager only)
 */
router.put("/:id/status", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ success: false, message: "Approved must be a boolean value" });
    }

    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ success: false, message: "Timesheet not found" });
    }

    timesheet.approved = approved;
    timesheet.approvedBy = req.user._id;
    timesheet.approvedAt = new Date();
    await timesheet.save();

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate("user", "name email role")
      .populate("project", "name")
      .populate("task", "title");

    res.json({
      success: true,
      message: `Timesheet ${approved ? 'approved' : 'rejected'} successfully`,
      timesheet: populatedTimesheet,
    });
  } catch (error) {
    console.error("❌ Update Timesheet Status Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
});

/**
 * @route   DELETE /api/timesheets/:id
 * @desc    Delete timesheet (Admin only)
 */
router.delete("/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndDelete(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ success: false, message: "Timesheet not found" });
    }

    res.json({
      success: true,
      message: "Timesheet deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Timesheet Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting timesheet" });
  }
});

export default router;
