// backend/models/Task.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    filename: String,
    url: String, // stored URL or local path
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new Schema(
  {
    // Basic details
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Relationships
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    // State machine
    state: {
      type: String,
      enum: ["New", "In Progress", "Blocked", "Done"],
      default: "New",
      index: true,
    },

    // Priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Scheduling
    dueDate: { type: Date },
    startDate: { type: Date, default: Date.now },

    // Time tracking
    timeLogged: { type: Number, default: 0 }, // total hours logged (update via Timesheet)
    estimatedHours: { type: Number, default: 0 },

    // Attachments & Comments
    comments: [CommentSchema],
    attachments: [AttachmentSchema],

    // Derived or computed
    progress: { type: Number, default: 0, min: 0, max: 100 },

    // Link to timesheets for cost tracking
    timesheets: [{ type: Schema.Types.ObjectId, ref: "Timesheet" }],

    // Misc
    tags: [{ type: String }],
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Instance method: add comment
 */
TaskSchema.methods.addComment = async function (userId, text) {
  this.comments.push({ user: userId, text });
  await this.save();
  return this.comments[this.comments.length - 1];
};

/**
 * Instance method: attach file
 */
TaskSchema.methods.addAttachment = async function (filename, url) {
  this.attachments.push({ filename, url });
  await this.save();
  return this.attachments[this.attachments.length - 1];
};

/**
 * Instance method: update progress (0–100)
 */
TaskSchema.methods.setProgress = function (value) {
  let p = Number(value);
  if (isNaN(p)) p = 0;
  if (p < 0) p = 0;
  if (p > 100) p = 100;
  this.progress = p;
  return this.progress;
};

/**
 * Virtual: isOverdue — true if dueDate passed and not Done
 */
TaskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  const now = new Date();
  return this.state !== "Done" && now > this.dueDate;
});

/**
 * Virtual: remainingHours — estimated - logged
 */
TaskSchema.virtual("remainingHours").get(function () {
  if (!this.estimatedHours) return 0;
  return Math.max(0, this.estimatedHours - this.timeLogged);
});

/**
 * Pre-save hook — clamp progress and ensure timeLogged not negative
 */
TaskSchema.pre("save", function (next) {
  if (this.timeLogged < 0) this.timeLogged = 0;
  if (this.progress < 0) this.progress = 0;
  if (this.progress > 100) this.progress = 100;
  next();
});

/**
 * Static method: update total time from related timesheets
 * (Use this when a timesheet is created or updated.)
 */
TaskSchema.statics.recalculateTimeLogged = async function (taskId) {
  const Timesheet = mongoose.model("Timesheet");
  const total = await Timesheet.aggregate([
    { $match: { task: new mongoose.Types.ObjectId(taskId) } },
    { $group: { _id: null, total: { $sum: "$hours" } } },
  ]);

  const hours = total.length > 0 ? total[0].total : 0;
  await this.findByIdAndUpdate(taskId, { timeLogged: hours });
  return hours;
};

/**
 * Method: change state safely (with validations)
 */
TaskSchema.methods.changeState = function (newState) {
  const allowedStates = ["New", "In Progress", "Blocked", "Done"];
  if (!allowedStates.includes(newState)) {
    throw new Error("Invalid state transition");
  }
  this.state = newState;
  return this.state;
};

module.exports = mongoose.model("Task", TaskSchema);
