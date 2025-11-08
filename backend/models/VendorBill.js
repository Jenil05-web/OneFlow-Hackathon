// backend/models/VendorBill.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * LineItemSchema — represents individual items billed by a vendor
 */
const LineItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * VendorBillSchema — tracks bills received from vendors (expenses)
 * Mirrors Invoice.js on the cost side.
 */
const VendorBillSchema = new Schema(
  {
    // Identification
    number: { type: String, unique: true, index: true },
    title: { type: String, default: "" },

    // Linked entities
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },

    // Vendor info
    vendorName: { type: String, required: true },
    vendorEmail: { type: String },
    vendorAddress: { type: String },

    // Bill details
    billDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    lines: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Payment tracking
    paid: { type: Boolean, default: false },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Card", "Cash", "UPI", "Other"],
      default: "Bank Transfer",
    },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Approved", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
      index: true,
    },

    // Audit / Approvals
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * 🔹 Calculate subtotal, tax, and total before saving
 */
VendorBillSchema.pre("save", function (next) {
  let subtotal = 0;
  if (this.lines && this.lines.length > 0) {
    this.lines.forEach((line) => {
      line.amount = line.quantity * line.unitPrice;
      subtotal += line.amount;
    });
  }

  this.subtotal = subtotal;
  this.taxAmount = (subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount;
  next();
});

/**
 * 🔹 Auto-generate bill number (e.g. VB-2025-001)
 */
VendorBillSchema.pre("save", async function (next) {
  if (!this.number) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("VendorBill").countDocuments();
    this.number = `VB-${year}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

/**
 * 🔹 After save — update linked Project cost & profit
 */
VendorBillSchema.post("save", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      // Compute total vendor bills (excluding cancelled)
      const agg = await mongoose.model("VendorBill").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalCost: { $sum: "$total" } } },
      ]);

      const totalCost = agg.length > 0 ? agg[0].totalCost : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const profit = (project.revenue || 0) - totalCost;
        await Project.findByIdAndUpdate(doc.project, {
          cost: totalCost,
          profit,
        });
      }
    }
    next();
  } catch (err) {
    console.error("❌ VendorBill post-save update failed:", err.message);
    next();
  }
});

/**
 * 🔹 After remove — recalc project cost & profit
 */
VendorBillSchema.post("remove", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      const agg = await mongoose.model("VendorBill").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalCost: { $sum: "$total" } } },
      ]);

      const totalCost = agg.length > 0 ? agg[0].totalCost : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const profit = (project.revenue || 0) - totalCost;
        await Project.findByIdAndUpdate(doc.project, {
          cost: totalCost,
          profit,
        });
      }
    }
    next();
  } catch (err) {
    console.error("❌ VendorBill post-remove update failed:", err.message);
    next();
  }
});

export default mongoose.model("VendorBill", VendorBillSchema);
