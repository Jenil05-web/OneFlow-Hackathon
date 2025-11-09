// backend/routes/projectRoutes.js
import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧠 Role-based access:
 * - Admin: full CRUD (only Admin can update/edit projects)
 * - Manager: can create, view, and assign team members to projects
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
    let projects = [];

    // Team Members see projects they're assigned to OR projects with tasks assigned to them
    if (req.user.role === "Team") {
      // First, find projects where user is explicitly in teamMembers or members
      const assignedProjectIds = await Project.distinct("_id", {
        $or: [
          { teamMembers: { $in: [req.user._id] } },
          { members: { $in: [req.user._id] } }
        ]
      });

      // Second, find projects that have tasks assigned to this user
      const taskProjectIds = await Task.distinct("project", {
        assignedTo: req.user._id
      });

      // Combine and get unique project IDs
      // Use Set with string representation to ensure uniqueness, then convert back
      const uniqueProjectIdStrings = [...new Set([
        ...assignedProjectIds.map(id => id.toString()),
        ...taskProjectIds.filter(id => id != null).map(id => id.toString())
      ])];

      // Fetch all projects (both explicitly assigned and those with assigned tasks)
      if (uniqueProjectIdStrings.length > 0) {
        // MongoDB can handle string IDs in $in queries, but let's use ObjectIds for consistency
        const mongoose = (await import("mongoose")).default;
        const allProjectIds = uniqueProjectIdStrings.map(idStr => {
          try {
            return new mongoose.Types.ObjectId(idStr);
          } catch {
            return null;
          }
        }).filter(id => id != null);
        
        if (allProjectIds.length > 0) {
          projects = await Project.find({
            _id: { $in: allProjectIds }
          })
            .populate("teamMembers", "name email role")
            .populate("members", "name email role")
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });
        }
      }
    } else {
      // Admin and Manager see all projects
      projects = await Project.find({})
        .populate("teamMembers", "name email role")
        .populate("members", "name email role")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    }

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
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Team members can view if assigned to project OR if they have tasks in this project
    if (req.user.role === "Team") {
      const isAssignedToProject = 
        (project.teamMembers && project.teamMembers.some(m => 
          (m._id || m).toString() === req.user._id.toString()
        )) ||
        (project.members && project.members.some(m => 
          (m._id || m).toString() === req.user._id.toString()
        ));
      
      // Check if user has tasks in this project
      const hasTasksInProject = await Task.findOne({ 
        project: req.params.id, 
        assignedTo: req.user._id 
      });
      
      if (!isAssignedToProject && !hasTasksInProject) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("❌ Get Project Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching project" });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details (Admin only)
 */
router.put("/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
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

    // Update both teamMembers and members for backward compatibility
    project.teamMembers = teamMembers;
    project.members = teamMembers; // Keep members in sync with teamMembers
    await project.save();

    // Populate before sending response
    await project.populate("teamMembers", "name email role");
    await project.populate("members", "name email role");

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
 * @desc    Update project status (Admin only)
 */
router.put("/:id/status", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
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
