// backend/routes/taskRoutes.js
import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧠 Role-based access:
 * - Admin → full CRUD (only Admin can update/edit tasks)
 * - Manager → can create, view tasks, and assign/reassign tasks to users
 * - Team Member → view only assigned tasks
 */

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (Admin / Manager only)
 */
router.post("/", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { project, title, description, assignedTo, dueDate, priority, tags, image, estimatedHours } = req.body;

    if (!project || !title) {
      return res.status(400).json({ success: false, message: "Project and title are required" });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const task = await Task.create({
      project,
      title,
      description: description || "",
      assignedTo,
      dueDate,
      priority: priority || "Medium",
      tags: tags || [],
      image: image || "",
      estimatedHours: estimatedHours || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("❌ Create Task Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating task" });
  }
});

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (Admins see all; Team sees only assigned)
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};

    // Support project filter
    if (req.query.project) {
      query.project = req.query.project;
    }

    if (req.user.role === "Team") {
      // Team members see only tasks assigned to them (within the project if specified)
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("❌ Get Tasks Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching tasks" });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task details
 */
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email")
      .sort({ "comments.createdAt": -1 });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Restrict team members from viewing tasks not assigned to them
    if (req.user.role === "Team" && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error("❌ Get Task Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching task" });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (Admin only)
 */
router.put("/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("❌ Update Task Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating task" });
  }
});

/**
 * @route   PUT /api/tasks/:id/status
 * @desc    Update task status (Admin only)
 */
router.put("/:id/status", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["To Do", "In Progress", "Review", "Completed", "Blocked"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("project", "name status")
      .populate("assignedTo", "name email role");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({
      success: true,
      message: `Task status updated to ${status}`,
      task,
    });
  } catch (error) {
    console.error("❌ Update Task Status Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating task status" });
  }
});

/**
 * @route   PUT /api/tasks/:id/assign
 * @desc    Assign or reassign a user to a task (Admin / Manager only)
 */
router.put("/:id/assign", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: "assignedTo user ID required" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true }).populate(
      "assignedTo",
      "name email role"
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.error("❌ Assign Task Error:", error.message);
    res.status(500).json({ success: false, message: "Server error assigning task" });
  }
});

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task (All authenticated users)
 */
router.post("/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check permissions
    if (req.user.role === "Team" && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const comment = await task.addComment(req.user._id, text.trim());
    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name email");

    res.json({
      success: true,
      message: "Comment added successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("❌ Add Comment Error:", error.message);
    res.status(500).json({ success: false, message: "Server error adding comment" });
  }
});

/**
 * @route   POST /api/tasks/:id/attachments
 * @desc    Add an attachment to a task (All authenticated users)
 */
router.post("/:id/attachments", ensureAuthenticated, async (req, res) => {
  try {
    const { filename, url } = req.body;
    if (!filename || !url) {
      return res.status(400).json({ success: false, message: "Filename and URL are required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check permissions
    if (req.user.role === "Team" && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const attachment = await task.addAttachment(filename, url);
    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email role");

    res.json({
      success: true,
      message: "Attachment added successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("❌ Add Attachment Error:", error.message);
    res.status(500).json({ success: false, message: "Server error adding attachment" });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (Admin only)
 */
router.delete("/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Task Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting task" });
  }
});

export default router;
