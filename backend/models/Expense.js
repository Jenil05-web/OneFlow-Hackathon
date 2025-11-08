// backend/models/Expense.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Expense Schema
 * Represents project or employee expenses (e.g., travel, meals, equipment)
 */
const ExpenseSchema = new Schema(
  {
    // Identification
    title: { type: String, required: true, trim: true },
    reference: { type: String, unique: true, index: true },

    // Relationships
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Details
    category: {
      type: String,
      enum: [
        "Travel",
        "Accommodation",
        "Meals",
        "Supplies",
        "Software",
        "Transportation",
        "Miscellaneous",
      ],
      default: "Miscellaneous",
    },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },

    // Attachments (e.g., receipt URLs)
    attachment: { type: String },

    // Status & approval workflow
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected", "Paid"],
      default: "Draft",
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    // Payment info
    paid: { type: Boolean, default: false },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "UPI", "Other"],
      default: "Cash",
    },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * 🔹 Auto-generate reference number (e.g., EXP-2025-001)
 */
ExpenseSchema.pre("save", async function (next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Expense").countDocuments();
    this.reference = `EXP-${year}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

/**
 * 🔹 After save — update linked Project cost & profit
 */
ExpenseSchema.post("save", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      // Calculate total approved expenses for this project
      const agg = await mongoose.model("Expense").aggregate([
        {
          $match: {
            project: doc.project,
            status: { $in: ["Approved", "Paid"] },
          },
        },
        { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
      ]);

      const totalExpenses = agg.length > 0 ? agg[0].totalExpenses : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const newCost = (project.cost || 0) + totalExpenses;
        const profit = (project.revenue || 0) - newCost;

        await Project.findByIdAndUpdate(doc.project, {
          cost: newCost,
          profit,
        });
      }
    }

    next();
  } catch (err) {
    console.error("❌ Expense post-save update failed:", err.message);
    next();
  }
});

/**
 * 🔹 After remove — recalc project total cost & profit
 */
ExpenseSchema.post("remove", async function (doc, next) {
  try {
    if (doc.project) {
      const Project = mongoose.model("Project");

      const agg = await mongoose.model("Expense").aggregate([
        {
          $match: {
            project: doc.project,
            status: { $in: ["Approved", "Paid"] },
          },
        },
        { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
      ]);

      const totalExpenses = agg.length > 0 ? agg[0].totalExpenses : 0;
      const project = await Project.findById(doc.project);

      if (project) {
        const newCost = (project.cost || 0) + totalExpenses;
        const profit = (project.revenue || 0) - newCost;

        await Project.findByIdAndUpdate(doc.project, {
          cost: newCost,
          profit,
        });
      }
    }
    next();
  } catch (err) {
    console.error("❌ Expense post-remove update failed:", err.message);
    next();
  }
});

export default mongoose.model("Expense", ExpenseSchema);
