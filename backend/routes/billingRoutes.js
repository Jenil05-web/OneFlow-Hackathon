// backend/routes/billingRoutes.js
import express from "express";
import Invoice from "../models/Invoice.js";
import VendorBill from "../models/VendorBill.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";
import Project from "../models/Project.js";
import { ensureAuthenticated, ensureRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧾 BILLING ROUTES
 * Supports:
 *  - Invoices (customer-facing)
 *  - Vendor Bills (supplier-facing)
 * Accessible:
 *  - Admin → Full access
 *  - Manager → Create/manage invoices
 *  - Team → View own invoices only
 */

//
// ==========================
// 🟢 INVOICES (CUSTOMER BILLING)
// ==========================
//

/**
 * @route   POST /api/billing/invoices
 * @desc    Create a new customer invoice (Admin/Manager)
 */
router.post("/invoices", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { clientName, clientEmail, clientAddress, project, salesOrder, lines, taxRate, dueDate, status } = req.body;

    if (!clientName || !project) {
      return res.status(400).json({ success: false, message: "Client name and project are required." });
    }

    // Optionally link to sales order
    const invoice = await Invoice.create({
      clientName,
      clientEmail,
      clientAddress,
      project,
      salesOrder,
      lines: lines || [],
      taxRate: taxRate || 0,
      dueDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("❌ Create Invoice Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating invoice" });
  }
});

/**
 * @route   GET /api/billing/invoices
 * @desc    Get all invoices (Team → only their own projects, supports project filter)
 */
router.get("/invoices", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};
    const { project } = req.query;

    // Filter by project if provided
    if (project) {
      query.project = project;
    }

    // Team members only see invoices for projects they're assigned to
    if (req.user.role === "Team") {
      // If filtering by project, verify user is assigned to it
      if (project) {
        const projectDoc = await Project.findById(project);
        if (!projectDoc || !projectDoc.teamMembers?.includes(req.user._id)) {
          return res.status(403).json({ success: false, message: "Access denied to this project" });
        }
      } else {
        // Get all projects user is assigned to
        const userProjects = await Project.find({ teamMembers: req.user._id }).select("_id");
        query.project = { $in: userProjects.map(p => p._id) };
      }
    }

    const invoices = await Invoice.find(query)
      .populate("project", "name")
      .populate("salesOrder", "number total status")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("❌ Get Invoices Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching invoices" });
  }
});

/**
 * @route   PUT /api/billing/invoices/:id
 * @desc    Update invoice details (Admin/Manager)
 */
router.put("/invoices/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    res.json({ success: true, message: "Invoice updated successfully", invoice });
  } catch (error) {
    console.error("❌ Update Invoice Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating invoice" });
  }
});

/**
 * @route   DELETE /api/billing/invoices/:id
 * @desc    Delete invoice (Admin only)
 */
router.delete("/invoices/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Invoice Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting invoice" });
  }
});

//
// ==========================
// 🔵 VENDOR BILLS (PURCHASES)
// ==========================
//

/**
 * @route   POST /api/billing/vendor-bills
 * @desc    Create a new vendor bill (Admin/Manager)
 */
router.post("/vendor-bills", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { vendorName, vendorEmail, vendorAddress, project, purchaseOrder, lines, taxRate, dueDate, status } = req.body;

    if (!vendorName || !project) {
      return res.status(400).json({ success: false, message: "Vendor name and project are required." });
    }

    const bill = await VendorBill.create({
      vendorName,
      vendorEmail,
      vendorAddress,
      project,
      purchaseOrder,
      lines: lines || [],
      taxRate: taxRate || 0,
      dueDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Vendor bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("❌ Create Vendor Bill Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating vendor bill" });
  }
});

/**
 * @route   GET /api/billing/vendor-bills
 * @desc    Get all vendor bills (Admin/Manager, supports project filter)
 */
router.get("/vendor-bills", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    let query = {};
    const { project } = req.query;

    if (project) {
      query.project = project;
    }

    const bills = await VendorBill.find(query)
      .populate("project", "name")
      .populate("purchaseOrder", "number total status")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    console.error("❌ Get Vendor Bills Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching vendor bills" });
  }
});

/**
 * @route   PUT /api/billing/vendor-bills/:id
 * @desc    Update a vendor bill (Admin/Manager)
 */
router.put("/vendor-bills/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const bill = await VendorBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: "Vendor bill not found" });

    res.json({ success: true, message: "Vendor bill updated successfully", bill });
  } catch (error) {
    console.error("❌ Update Vendor Bill Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating vendor bill" });
  }
});

/**
 * @route   DELETE /api/billing/vendor-bills/:id
 * @desc    Delete vendor bill (Admin only)
 */
router.delete("/vendor-bills/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const bill = await VendorBill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Vendor bill not found" });

    res.json({ success: true, message: "Vendor bill deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Vendor Bill Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting vendor bill" });
  }
});

//
// ==========================
// 🟡 SALES ORDERS
// ==========================
//

/**
 * @route   POST /api/billing/sales-orders
 * @desc    Create a new sales order (Admin/Manager)
 */
router.post("/sales-orders", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { partnerName, partnerEmail, project, lines, taxRate, orderDate, dueDate, status } = req.body;

    if (!partnerName || !project) {
      return res.status(400).json({ success: false, message: "Partner name and project are required." });
    }

    const salesOrder = await SalesOrder.create({
      partnerName,
      partnerEmail,
      project,
      lines: lines || [],
      taxRate: taxRate || 0,
      orderDate: orderDate || new Date(),
      dueDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      salesOrder,
    });
  } catch (error) {
    console.error("❌ Create Sales Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating sales order" });
  }
});

/**
 * @route   GET /api/billing/sales-orders
 * @desc    Get all sales orders (supports project filter)
 */
router.get("/sales-orders", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};
    const { project } = req.query;

    if (project) {
      query.project = project;
    }

    const salesOrders = await SalesOrder.find(query)
      .populate("project", "name")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: salesOrders.length,
      salesOrders,
    });
  } catch (error) {
    console.error("❌ Get Sales Orders Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching sales orders" });
  }
});

/**
 * @route   PUT /api/billing/sales-orders/:id
 * @desc    Update sales order (Admin/Manager)
 */
router.put("/sales-orders/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salesOrder) return res.status(404).json({ success: false, message: "Sales order not found" });

    res.json({ success: true, message: "Sales order updated successfully", salesOrder });
  } catch (error) {
    console.error("❌ Update Sales Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating sales order" });
  }
});

/**
 * @route   DELETE /api/billing/sales-orders/:id
 * @desc    Delete sales order (Admin only)
 */
router.delete("/sales-orders/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndDelete(req.params.id);
    if (!salesOrder) return res.status(404).json({ success: false, message: "Sales order not found" });

    res.json({ success: true, message: "Sales order deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Sales Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting sales order" });
  }
});

//
// ==========================
// 🟠 PURCHASE ORDERS
// ==========================
//

/**
 * @route   POST /api/billing/purchase-orders
 * @desc    Create a new purchase order (Admin/Manager)
 */
router.post("/purchase-orders", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { vendorName, vendorEmail, vendorPhone, project, lines, taxRate, orderDate, deliveryDate, status } = req.body;

    if (!vendorName || !project) {
      return res.status(400).json({ success: false, message: "Vendor name and project are required." });
    }

    const purchaseOrder = await PurchaseOrder.create({
      vendorName,
      vendorEmail,
      vendorPhone,
      project,
      lines: lines || [],
      taxRate: taxRate || 0,
      orderDate: orderDate || new Date(),
      deliveryDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      purchaseOrder,
    });
  } catch (error) {
    console.error("❌ Create Purchase Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating purchase order" });
  }
});

/**
 * @route   GET /api/billing/purchase-orders
 * @desc    Get all purchase orders (supports project filter)
 */
router.get("/purchase-orders", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};
    const { project } = req.query;

    if (project) {
      query.project = project;
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate("project", "name")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: purchaseOrders.length,
      purchaseOrders,
    });
  } catch (error) {
    console.error("❌ Get Purchase Orders Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching purchase orders" });
  }
});

/**
 * @route   PUT /api/billing/purchase-orders/:id
 * @desc    Update purchase order (Admin/Manager)
 */
router.put("/purchase-orders/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchaseOrder) return res.status(404).json({ success: false, message: "Purchase order not found" });

    res.json({ success: true, message: "Purchase order updated successfully", purchaseOrder });
  } catch (error) {
    console.error("❌ Update Purchase Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating purchase order" });
  }
});

/**
 * @route   DELETE /api/billing/purchase-orders/:id
 * @desc    Delete purchase order (Admin only)
 */
router.delete("/purchase-orders/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) return res.status(404).json({ success: false, message: "Purchase order not found" });

    res.json({ success: true, message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Purchase Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting purchase order" });
  }
});

//
// ==========================
// 🟣 EXPENSES
// ==========================
//

/**
 * @route   POST /api/billing/expenses
 * @desc    Create a new expense (Team/Manager/Admin)
 */
router.post("/expenses", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, category, amount, date, project, attachment } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: "Title and amount are required." });
    }

    const expense = await Expense.create({
      title,
      description,
      category: category || "Miscellaneous",
      amount,
      date: date || new Date(),
      project,
      attachment,
      user: req.user._id,
      createdBy: req.user._id,
      status: "Submitted",
    });

    res.status(201).json({
      success: true,
      message: "Expense submitted successfully",
      expense,
    });
  } catch (error) {
    console.error("❌ Create Expense Error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating expense" });
  }
});

/**
 * @route   GET /api/billing/expenses
 * @desc    Get all expenses (supports project filter, Team sees only their own)
 */
router.get("/expenses", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};
    const { project } = req.query;

    if (project) {
      query.project = project;
    }

    // Team members only see their own expenses
    if (req.user.role === "Team") {
      query.user = req.user._id;
    }

    const expenses = await Expense.find(query)
      .populate("project", "name")
      .populate("user", "name email")
      .populate("approvedBy", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("❌ Get Expenses Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching expenses" });
  }
});

/**
 * @route   PUT /api/billing/expenses/:id
 * @desc    Update expense (Owner or Admin/Manager)
 */
router.put("/expenses/:id", ensureAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    // Only owner or admin/manager can edit
    if (req.user.role === "Team" && String(expense.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ success: true, message: "Expense updated successfully", expense: updatedExpense });
  } catch (error) {
    console.error("❌ Update Expense Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating expense" });
  }
});

/**
 * @route   PUT /api/billing/expenses/:id/approve
 * @desc    Approve or reject expense (Admin/Manager only)
 */
router.put("/expenses/:id/approve", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    res.json({ success: true, message: `Expense ${status.toLowerCase()} successfully`, expense });
  } catch (error) {
    console.error("❌ Approve Expense Error:", error.message);
    res.status(500).json({ success: false, message: "Server error approving expense" });
  }
});

/**
 * @route   DELETE /api/billing/expenses/:id
 * @desc    Delete expense (Owner or Admin)
 */
router.delete("/expenses/:id", ensureAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    // Only owner or admin can delete
    if (req.user.role !== "Admin" && String(expense.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Expense Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting expense" });
  }
});

//
// ==========================
// 🟢 PRODUCTS
// ==========================
//

/**
 * @route   POST /api/billing/products
 * @desc    Create a new product (Admin/Manager)
 */
router.post("/products", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const { name, types, salesPrice, salesTaxes, cost, unit, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Product name is required." });
    }

    const product = await Product.create({
      name,
      types: types || { sales: false, purchase: false, expenses: false },
      salesPrice: salesPrice || 0,
      salesTaxes: salesTaxes || 0,
      cost: cost || 0,
      unit: unit || "Unit",
      description: description || "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Create Product Error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Product name already exists" });
    }
    res.status(500).json({ success: false, message: "Server error creating product" });
  }
});

/**
 * @route   GET /api/billing/products
 * @desc    Get all products
 */
router.get("/products", ensureAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
});

/**
 * @route   GET /api/billing/products/:id
 * @desc    Get single product
 */
router.get("/products/:id", ensureAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("❌ Get Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching product" });
  }
});

/**
 * @route   PUT /api/billing/products/:id
 * @desc    Update a product (Admin/Manager)
 */
router.put("/products/:id", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Update Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating product" });
  }
});

/**
 * @route   DELETE /api/billing/products/:id
 * @desc    Delete a product (Admin only)
 */
router.delete("/products/:id", ensureAuthenticated, ensureRole(["Admin"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting product" });
  }
});

export default router;
