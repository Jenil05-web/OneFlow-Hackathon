// backend/models/Project.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    // Basic info
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, index: true }, // optional short code/identifier
    description: { type: String, default: "" },

    // Ownership
    manager: { type: Schema.Types.ObjectId, ref: "User", required: false },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Status & dates
    status: {
      type: String,
      enum: ["Planned", "In Progress", "On Hold", "Completed"],
      default: "Planned",
      index: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },

    // Financials
    budget: { type: Number, default: 0 },   // planned budget
    revenue: { type: Number, default: 0 },  // aggregated from Invoices / SO lines
    cost: { type: Number, default: 0 },     // aggregated from VendorBills + Timesheets + Expenses
    profit: { type: Number, default: 0 },   // revenue - cost (kept in sync)

    // Progress / utilization
    progress: { type: Number, default: 0, min: 0, max: 100 }, // percent

    // Links to other documents (store ids for quick filtering)
    links: {
      salesOrders: [{ type: Schema.Types.ObjectId, ref: "SalesOrder" }],
      purchaseOrders: [{ type: Schema.Types.ObjectId, ref: "PurchaseOrder" }],
      invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
      vendorBills: [{ type: Schema.Types.ObjectId, ref: "VendorBill" }],
      expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
    },

    // Optional metadata
    tags: [{ type: String }],
    archived: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Instance method: recalculate financial fields (profit)
 * Call this after you update revenue or cost from other services.
 */
ProjectSchema.methods.recalculateFinancials = function () {
  // ensure numbers
  const revenue = Number(this.revenue || 0);
  const cost = Number(this.cost || 0);
  this.profit = revenue - cost;
  return this.profit;
};

/**
 * Instance method: update progress
 * Accepts a number (0-100) or calculates a best-effort value (if provided detail needed).
 */
ProjectSchema.methods.setProgress = function (value) {
  let p = Number(value);
  if (Number.isNaN(p)) p = 0;
  if (p < 0) p = 0;
  if (p > 100) p = 100;
  this.progress = p;
  return this.progress;
};

/**
 * Virtual: durationDays - computed from startDate/endDate
 */
ProjectSchema.virtual("durationDays").get(function () {
  if (!this.startDate || !this.endDate) return null;
  const ms = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
});

/**
 * Pre-save hook: keep profit consistent
 */
ProjectSchema.pre("save", function (next) {
  // make sure profit is always revenue - cost
  this.profit = Number(this.revenue || 0) - Number(this.cost || 0);

  // clamp progress
  if (this.progress < 0) this.progress = 0;
  if (this.progress > 100) this.progress = 100;

  next();
});

/**
 * Static helper: recompute aggregates for a project by fetching related docs.
 * (placeholder - call from service/controller where you can query invoices/bills/timesheets)
 *
 * Example usage (in a controller):
 * const project = await Project.findById(projectId);
 * await project.recomputeFromLinkedDocuments(invoiceSum, vendorBillSum, timesheetCostSum, expenseSum);
 */
ProjectSchema.methods.recomputeFromLinkedDocuments = async function ({ invoiceTotal = 0, vendorBillTotal = 0, timesheetCost = 0, expenseTotal = 0 } = {}) {
  // Invoice/revenue
  this.revenue = Number(invoiceTotal || 0);

  // Cost is sum of vendor bills + timesheets + expenses
  this.cost = Number(vendorBillTotal || 0) + Number(timesheetCost || 0) + Number(expenseTotal || 0);

  // Recalculate profit
  this.profit = this.revenue - this.cost;

  // Optionally update progress if you compute milestones elsewhere
  // this.progress = computeProgressSomehow();

  return this.save();
};

module.exports = mongoose.model("Project", ProjectSchema);
