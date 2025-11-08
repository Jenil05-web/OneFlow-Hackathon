// backend/models/SalesOrder.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * LineItemSchema — represents each line of the Sales Order
 * (e.g., service type, quantity, unit price, subtotal)
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
 * SalesOrderSchema — represents an order from a customer.
 * This is a source of revenue and can generate one or more invoices.
 */
const SalesOrderSchema = new Schema(
  {
    // Identification
    number: { type: String, unique: true, index: true },
    title: { type: String, default: "" },

    // Customer / Partner info
    partnerName: { type: String, required: true },
    partnerEmail: { type: String },

    // Project linkage
    project: { type: Schema.Types.ObjectId, ref: "Project" },

    // Order details
    orderDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    lines: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 }, // % tax if applicable
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Confirmed", "Cancelled", "Completed"],
      default: "Draft",
      index: true,
    },

    // Relations
    invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * 🔹 Helper: Calculate subtotal, tax, and total before saving.
 */
SalesOrderSchema.pre("save", function (next) {
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
 * 🔹 Auto-generate order number if not set (e.g., SO-2025-001)
 */
SalesOrderSchema.pre("save", async function (next) {
  if (!this.number) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("SalesOrder").countDocuments();
    this.number = `SO-${year}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

/**
 * 🔹 After save — update linked Project’s revenue.
 */
SalesOrderSchema.post("save", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");
      // Compute total revenue from all SOs for this project
      const agg = await mongoose.model("SalesOrder").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]);
      const totalRevenue = agg.length > 0 ? agg[0].totalRevenue : 0;
      await Project.findByIdAndUpdate(doc.project, { revenue: totalRevenue });
    }
    next();
  } catch (err) {
    console.error("❌ SalesOrder post-save revenue update failed:", err.message);
    next();
  }
});

/**
 * 🔹 Post-remove — update project revenue if SO deleted
 */
SalesOrderSchema.post("remove", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");
      const agg = await mongoose.model("SalesOrder").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]);
      const totalRevenue = agg.length > 0 ? agg[0].totalRevenue : 0;
      await Project.findByIdAndUpdate(doc.project, { revenue: totalRevenue });
    }
    next();
  } catch (err) {
    console.error("❌ SalesOrder post-remove error:", err.message);
    next();
  }
});

export default mongoose.model("SalesOrder", SalesOrderSchema);
