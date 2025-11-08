// backend/routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Invoice from "../models/Invoice.js";
import VendorBill from "../models/VendorBill.js";
import Expense from "../models/Expense.js";
import Project from "../models/Project.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ============================================
 * USER MANAGEMENT
 * ============================================
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get("/users", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ role: 1, name: 1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching users" });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user
 * @access  Admin only
 */
router.get("/users/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching user" });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user (Manager or Team member)
 * @access  Admin only
 */
router.post("/users", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { name, email, password, role, hourlyRate } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    // Validate role (Admin cannot create other Admins via this route for security)
    if (role && !["Manager", "Team"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be either 'Manager' or 'Team'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: role || "Team",
      hourlyRate: hourlyRate || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `${role || "Team"} member created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hourlyRate: user.hourlyRate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error while creating user" });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (role, hourlyRate, isActive)
 * @access  Admin only
 */
router.put("/users/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { role, hourlyRate, isActive, name, email } = req.body;
    const updateData = {};

    if (role && ["Admin", "Manager", "Team"].includes(role)) {
      updateData.role = role;
    }
    if (hourlyRate !== undefined) {
      updateData.hourlyRate = Number(hourlyRate);
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }
    if (name) {
      updateData.name = name;
    }
    if (email) {
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    res.status(500).json({ success: false, message: "Server error while updating user" });
  }
});

/**
 * @route   PUT /api/admin/users/:id/hourly-rate
 * @desc    Update user hourly rate
 * @access  Admin only
 */
router.put("/users/:id/hourly-rate", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { hourlyRate } = req.body;

    if (hourlyRate === undefined || hourlyRate < 0) {
      return res.status(400).json({ success: false, message: "Valid hourly rate is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hourlyRate: Number(hourlyRate) },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `Hourly rate updated to ₹${hourlyRate}/hour`,
      user,
    });
  } catch (error) {
    console.error("❌ Error updating hourly rate:", error.message);
    res.status(500).json({ success: false, message: "Server error while updating hourly rate" });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete("/users/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting user" });
  }
});

/**
 * ============================================
 * GLOBAL LISTS MANAGEMENT
 * ============================================
 */

/**
 * @route   GET /api/admin/sales-orders
 * @desc    Get all sales orders (with search, filter, group by)
 * @access  Admin only
 */
router.get("/sales-orders", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { search, project, partner, status, groupBy } = req.query;
    let query = {};

    // Search
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (project) query.project = project;
    if (partner) query["customer._id"] = partner;
    if (status) query.status = status;

    let salesOrders = await SalesOrder.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    // Group by
    if (groupBy === "project") {
      const grouped = {};
      salesOrders.forEach((so) => {
        const key = so.project?._id?.toString() || "unassigned";
        if (!grouped[key]) {
          grouped[key] = { project: so.project, orders: [] };
        }
        grouped[key].orders.push(so);
      });
      return res.json({ success: true, grouped: Object.values(grouped) });
    }

    if (groupBy === "status") {
      const grouped = {};
      salesOrders.forEach((so) => {
        const status = so.status || "draft";
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(so);
      });
      return res.json({ success: true, grouped });
    }

    res.json({
      success: true,
      count: salesOrders.length,
      salesOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching sales orders:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching sales orders" });
  }
});

/**
 * @route   GET /api/admin/purchase-orders
 * @desc    Get all purchase orders
 * @access  Admin only
 */
router.get("/purchase-orders", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { search, project, vendor, status, groupBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "vendor.name": { $regex: search, $options: "i" } },
      ];
    }

    if (project) query.project = project;
    if (vendor) query["vendor._id"] = vendor;
    if (status) query.status = status;

    let purchaseOrders = await PurchaseOrder.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    if (groupBy === "project") {
      const grouped = {};
      purchaseOrders.forEach((po) => {
        const key = po.project?._id?.toString() || "unassigned";
        if (!grouped[key]) {
          grouped[key] = { project: po.project, orders: [] };
        }
        grouped[key].orders.push(po);
      });
      return res.json({ success: true, grouped: Object.values(grouped) });
    }

    res.json({
      success: true,
      count: purchaseOrders.length,
      purchaseOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching purchase orders:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching purchase orders" });
  }
});

/**
 * @route   GET /api/admin/invoices
 * @desc    Get all customer invoices
 * @access  Admin only
 */
router.get("/invoices", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { search, project, customer, status, groupBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    if (project) query.project = project;
    if (customer) query["customer._id"] = customer;
    if (status) query.status = status;

    let invoices = await Invoice.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    if (groupBy === "project") {
      const grouped = {};
      invoices.forEach((inv) => {
        const key = inv.project?._id?.toString() || "unassigned";
        if (!grouped[key]) {
          grouped[key] = { project: inv.project, invoices: [] };
        }
        grouped[key].invoices.push(inv);
      });
      return res.json({ success: true, grouped: Object.values(grouped) });
    }

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("❌ Error fetching invoices:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching invoices" });
  }
});

/**
 * @route   GET /api/admin/vendor-bills
 * @desc    Get all vendor bills
 * @access  Admin only
 */
router.get("/vendor-bills", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { search, project, vendor, status, groupBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: "i" } },
        { "vendor.name": { $regex: search, $options: "i" } },
      ];
    }

    if (project) query.project = project;
    if (vendor) query["vendor._id"] = vendor;
    if (status) query.status = status;

    let vendorBills = await VendorBill.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    if (groupBy === "project") {
      const grouped = {};
      vendorBills.forEach((vb) => {
        const key = vb.project?._id?.toString() || "unassigned";
        if (!grouped[key]) {
          grouped[key] = { project: vb.project, bills: [] };
        }
        grouped[key].bills.push(vb);
      });
      return res.json({ success: true, grouped: Object.values(grouped) });
    }

    res.json({
      success: true,
      count: vendorBills.length,
      vendorBills,
    });
  } catch (error) {
    console.error("❌ Error fetching vendor bills:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching vendor bills" });
  }
});

/**
 * @route   GET /api/admin/expenses
 * @desc    Get all expenses
 * @access  Admin only
 */
router.get("/expenses", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { search, project, submittedBy, status, groupBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (project) query.project = project;
    if (submittedBy) query.submittedBy = submittedBy;
    if (status) query.status = status;

    let expenses = await Expense.find(query)
      .populate("project", "name")
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    if (groupBy === "project") {
      const grouped = {};
      expenses.forEach((exp) => {
        const key = exp.project?._id?.toString() || "unassigned";
        if (!grouped[key]) {
          grouped[key] = { project: exp.project, expenses: [] };
        }
        grouped[key].expenses.push(exp);
      });
      return res.json({ success: true, grouped: Object.values(grouped) });
    }

    res.json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("❌ Error fetching expenses:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching expenses" });
  }
});

/**
 * @route   PUT /api/admin/:type/:id/link-project
 * @desc    Link a document (SO/PO/Invoice/VendorBill/Expense) to a project
 * @access  Admin only
 */
router.put("/:type/:id/link-project", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { projectId } = req.body;

    const models = {
      "sales-orders": SalesOrder,
      "purchase-orders": PurchaseOrder,
      "invoices": Invoice,
      "vendor-bills": VendorBill,
      "expenses": Expense,
    };

    const Model = models[type];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid document type" });
    }

    // Verify project exists
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
    }

    const doc = await Model.findByIdAndUpdate(id, { project: projectId || null }, { new: true })
      .populate("project", "name");

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.json({
      success: true,
      message: "Document linked to project successfully",
      document: doc,
    });
  } catch (error) {
    console.error("❌ Error linking document:", error.message);
    res.status(500).json({ success: false, message: "Server error while linking document" });
  }
});

export default router;
