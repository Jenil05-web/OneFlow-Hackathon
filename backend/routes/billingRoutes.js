// backend/routes/billingRoutes.js
import express from "express";
import Invoice from "../models/Invoice.js";
import VendorBill from "../models/VendorBill.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
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
    const { customer, project, salesOrder, amount, dueDate, status } = req.body;

    if (!customer || !project || !amount) {
      return res.status(400).json({ success: false, message: "Customer, project, and amount are required." });
    }

    // Optionally link to sales order
    const invoice = await Invoice.create({
      customer,
      project,
      salesOrder,
      amount,
      dueDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    // Update project revenue
    const totalRevenue = await Invoice.computeProjectRevenue(project);
    await Project.findByIdAndUpdate(project, { revenue: totalRevenue });

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
 * @desc    Get all invoices (Team → only their own projects)
 */
router.get("/invoices", ensureAuthenticated, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Team") {
      query["project.members"] = req.user._id;
    }

    const invoices = await Invoice.find(query)
      .populate("customer", "name email")
      .populate("project", "name")
      .populate("salesOrder", "orderNumber totalAmount status")
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

    // Recalculate project revenue if changed
    const totalRevenue = await Invoice.computeProjectRevenue(invoice.project);
    await Project.findByIdAndUpdate(invoice.project, { revenue: totalRevenue });

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
    const { vendor, project, purchaseOrder, amount, dueDate, status } = req.body;

    if (!vendor || !project || !amount) {
      return res.status(400).json({ success: false, message: "Vendor, project, and amount are required." });
    }

    const bill = await VendorBill.create({
      vendor,
      project,
      purchaseOrder,
      amount,
      dueDate,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    // Update project cost (from all bills)
    const totalCost = await VendorBill.computeProjectCost(project);
    await Project.findByIdAndUpdate(project, { cost: totalCost });

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
 * @desc    Get all vendor bills (Admin/Manager)
 */
router.get("/vendor-bills", ensureAuthenticated, ensureRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const bills = await VendorBill.find()
      .populate("vendor", "name email")
      .populate("project", "name")
      .populate("purchaseOrder", "orderNumber totalAmount status")
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

    const totalCost = await VendorBill.computeProjectCost(bill.project);
    await Project.findByIdAndUpdate(bill.project, { cost: totalCost });

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

export default router;
