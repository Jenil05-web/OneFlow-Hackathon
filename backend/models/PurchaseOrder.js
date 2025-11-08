// backend/models/PurchaseOrder.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * LineItemSchema — represents each item/service purchased
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
 * PurchaseOrderSchema — represents vendor purchase orders.
 * This is a source of project expenses and updates project.cost automatically.
 */
const PurchaseOrderSchema = new Schema(
  {
    // Identification
    number: { type: String, unique: true, index: true },
    title: { type: String, default: "" },

    // Vendor / supplier info
    vendorName: { type: String, required: true },
    vendorEmail: { type: String },
    vendorPhone: { type: String },

    // Project linkage
    project: { type: Schema.Types.ObjectId, ref: "Project" },

    // Order details
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },

    lines: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Approved", "Received", "Cancelled"],
      default: "Draft",
      index: true,
    },

    // Payment info
    paid: { type: Boolean, default: false },
    paymentDate: { type: Date },

    // Relations
    bills: [{ type: Schema.Types.ObjectId, ref: "VendorBill" }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * 🔹 Auto-calculate subtotal, tax, and total before saving
 */
PurchaseOrderSchema.pre("save", function (next) {
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
 * 🔹 Auto-generate order number (e.g. PO-2025-001)
 */
PurchaseOrderSchema.pre("save", async function (next) {
  if (!this.number) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("PurchaseOrder").countDocuments();
    this.number = `PO-${year}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

/**
 * 🔹 After save — update linked Project’s total cost
 */
PurchaseOrderSchema.post("save", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      const agg = await mongoose.model("PurchaseOrder").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalCost: { $sum: "$total" } } },
      ]);

      const totalCost = agg.length > 0 ? agg[0].totalCost : 0;
      await Project.findByIdAndUpdate(doc.project, { cost: totalCost });
    }
    next();
  } catch (err) {
    console.error("❌ PurchaseOrder post-save update failed:", err.message);
    next();
  }
});

/**
 * 🔹 After remove — recalc project total cost
 */
PurchaseOrderSchema.post("remove", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");
      const agg = await mongoose.model("PurchaseOrder").aggregate([
        { $match: { project: doc.project, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalCost: { $sum: "$total" } } },
      ]);
      const totalCost = agg.length > 0 ? agg[0].totalCost : 0;
      await Project.findByIdAndUpdate(doc.project, { cost: totalCost });
    }
    next();
  } catch (err) {
    console.error("❌ PurchaseOrder post-remove error:", err.message);
    next();
  }
});

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);
