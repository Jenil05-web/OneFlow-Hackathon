// backend/routes/projectRoutes.js
import express from "express";
import Project from "../models/Project.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧠 Role-based access:
 * - Admin: full CRUD
 * - Manager: can create, view, and update
 * - Team: can view assigned projects only
 */

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin / Manager only)
 */
router.post("/", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { name, description, client, startDate, endDate, budget, manager, teamMembers, image, code, tags, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      code,
      description,
      client: client || "",
      startDate,
      endDate,
      budget: budget || 0,
      manager: manager || req.user._id, // Default to current user if not specified
      teamMembers: teamMembers || [],
      image: image || "",
      tags: tags || [],
      status: status || "Planned",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("❌ Create Project Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating project" });
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects (Admin/Manager full access; Team limited view)
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};

    // Team Members only see projects they're assigned to
    if (req.user.role === "Team") {
      query = { teamMembers: req.user._id };
    }

    const projects = await Project.find(query)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("❌ Get Projects Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching projects" });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project details
 */
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Team members can only view if assigned
    if (req.user.role === "Team" && !project.teamMembers.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("❌ Get Project Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching project" });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details (Admin / Manager only)
 */
router.put("/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const updates = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("❌ Update Project Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating project" });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (Admin only)
 */
router.delete("/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Project Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting project" });
  }
});

/**
 * @route   PUT /api/projects/:id/assign
 * @desc    Assign team members to a project (Admin / Manager only)
 */
router.put("/:id/assign", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { teamMembers } = req.body;

    if (!teamMembers || !Array.isArray(teamMembers)) {
      return res.status(400).json({ success: false, message: "teamMembers must be an array of user IDs" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.teamMembers = teamMembers;
    await project.save();

    res.json({
      success: true,
      message: "Team members assigned successfully",
      project,
    });
  } catch (error) {
    console.error("❌ Assign Members Error:", error.message);
    res.status(500).json({ success: false, message: "Server error assigning team members" });
  }
});

/**
 * @route   PUT /api/projects/:id/status
 * @desc    Update project status (Admin / Manager only)
 */
router.put("/:id/status", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({
      success: true,
      message: `Project status updated to ${status}`,
      project,
    });
  } catch (error) {
    console.error("❌ Update Status Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating project status" });
  }
});

export default router;
