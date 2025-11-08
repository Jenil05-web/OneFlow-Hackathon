// backend/models/Invoice.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * LineItemSchema — for each billed service/deliverable
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
 * InvoiceSchema — represents client billing based on a SalesOrder or project.
 */
const InvoiceSchema = new Schema(
  {
    // Identification
    number: { type: String, unique: true, index: true },
    title: { type: String, default: "" },

    // Linked entities
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    salesOrder: { type: Schema.Types.ObjectId, ref: "SalesOrder" },

    // Customer info
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    clientAddress: { type: String },

    // Invoice details
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    lines: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Payment tracking
    paid: { type: Boolean, default: false },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["Bank Transfer", "Card", "Cash", "UPI", "Other"], default: "Bank Transfer" },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
      index: true,
    },

    // Approval
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * 🔹 Auto-calculate subtotal, tax, and total before saving
 */
InvoiceSchema.pre("save", function (next) {
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
 * 🔹 Auto-generate invoice number (e.g. INV-2025-001)
 */
InvoiceSchema.pre("save", async function (next) {
  if (!this.number) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Invoice").countDocuments();
    this.number = `INV-${year}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

/**
 * 🔹 After save — update linked Project.revenue & profit
 */
InvoiceSchema.post("save", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      // Compute total invoiced revenue (exclude cancelled)
      const agg = await mongoose.model("Invoice").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]);

      const totalRevenue = agg.length > 0 ? agg[0].totalRevenue : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const profit = totalRevenue - (project.cost || 0);
        await Project.findByIdAndUpdate(doc.project, {
          revenue: totalRevenue,
          profit,
        });
      }
    }

    next();
  } catch (err) {
    console.error("❌ Invoice post-save update failed:", err.message);
    next();
  }
});

/**
 * 🔹 After remove — recalc project revenue and profit
 */
InvoiceSchema.post("remove", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");
      const agg = await mongoose.model("Invoice").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]);

      const totalRevenue = agg.length > 0 ? agg[0].totalRevenue : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const profit = totalRevenue - (project.cost || 0);
        await Project.findByIdAndUpdate(doc.project, {
          revenue: totalRevenue,
          profit,
        });
      }
    }

    next();
  } catch (err) {
    console.error("❌ Invoice post-remove update failed:", err.message);
    next();
  }
});

export default mongoose.model("Invoice", InvoiceSchema);
