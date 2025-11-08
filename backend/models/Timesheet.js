// backend/models/Timesheet.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Timesheet Schema
 * Each entry = a log of hours for a specific task/project/user on a date.
 * Used for project costing and employee utilization.
 */
const TimesheetSchema = new Schema(
  {
    // Relationships
    task: { type: Schema.Types.ObjectId, ref: "Task", required: false },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Time details
    date: { type: Date, required: true, default: Date.now },
    hours: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: "" },

    // Billing / cost tracking
    billable: { type: Boolean, default: true },
    hourlyRate: { type: Number, default: 0 }, // store snapshot at entry time
    cost: { type: Number, default: 0 }, // computed: hours * hourlyRate

    // Approvals
    approved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    // Audit
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: auto-calculate cost
 * and update related Task.timeLogged
 */
TimesheetSchema.pre("save", async function (next) {
  try {
    // Compute cost
    if (!this.hourlyRate && this.user) {
      const User = mongoose.model("User");
      const u = await User.findById(this.user).select("hourlyRate");
      if (u && u.hourlyRate) this.hourlyRate = u.hourlyRate;
    }
    this.cost = this.hours * this.hourlyRate;

    // Update task.timeLogged total (if task linked)
    if (this.task) {
      const Task = mongoose.model("Task");
      await Task.recalculateTimeLogged(this.task);
    }

    next();
  } catch (err) {
    console.error("Timesheet pre-save error:", err.message);
    next(err);
  }
});

/**
 * Post-remove hook: recalc Task.timeLogged when a timesheet is deleted
 */
TimesheetSchema.post("remove", async function (doc, next) {
  try {
    if (doc.task) {
      const Task = mongoose.model("Task");
      await Task.recalculateTimeLogged(doc.task);
    }
    next();
  } catch (err) {
    console.error("Timesheet post-remove error:", err.message);
    next(err);
  }
});

/**
 * Static method: compute total cost for a project
 * (used for project financial aggregation)
 */
TimesheetSchema.statics.computeProjectCost = async function (projectId) {
  const result = await this.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: null, totalCost: { $sum: "$cost" } } },
  ]);
  return result.length > 0 ? result[0].totalCost : 0;
};

/**
 * Static method: get total hours logged per user (for utilization)
 */
TimesheetSchema.statics.getUserTotalHours = async function (userId, start, end) {
  const query = { user: new mongoose.Types.ObjectId(userId) };
  if (start && end) query.date = { $gte: start, $lte: end };

  const res = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$hours" } } },
  ]);

  return res.length > 0 ? res[0].total : 0;
};

/**
 * Virtual: week number for analytics
 */
TimesheetSchema.virtual("week").get(function () {
  const d = new Date(this.date);
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((dayOfYear + firstJan.getDay() + 1) / 7);
});

export default mongoose.model("Timesheet", TimesheetSchema);
