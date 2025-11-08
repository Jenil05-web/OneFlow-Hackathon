// backend/models/Task.js
import mongoose from "mongoose";
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
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Changed from 'assignee' to match routes
    assignee: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Keep for backward compatibility
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Status - using route values
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Review", "Completed", "Blocked"],
      default: "To Do",
      index: true,
    },
    // Keep 'state' for backward compatibility, but sync with status
    state: {
      type: String,
      enum: ["New", "In Progress", "Blocked", "Done"],
      default: "New",
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
    image: { type: String, default: "" }, // Task image URL
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save hook: Sync assignedTo and assignee, status and state
 */
TaskSchema.pre("save", function (next) {
  // Sync assignee with assignedTo
  if (this.assignedTo) {
    this.assignee = this.assignedTo;
  } else if (this.assignee) {
    this.assignedTo = this.assignee;
  }

  // Sync state with status (map route values to requirement values)
  const statusToStateMap = {
    "To Do": "New",
    "In Progress": "In Progress",
    "Review": "In Progress", // Review is intermediate state
    "Completed": "Done",
    "Blocked": "Blocked",
  };
  if (this.status && statusToStateMap[this.status]) {
    this.state = statusToStateMap[this.status];
  }

  // Sync state to status (reverse mapping)
  const stateToStatusMap = {
    New: "To Do",
    "In Progress": "In Progress",
    Blocked: "Blocked",
    Done: "Completed",
  };
  if (this.state && stateToStatusMap[this.state] && !this.status) {
    this.status = stateToStatusMap[this.state];
  }

  next();
});

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
 * Virtual: isOverdue — true if dueDate passed and not Completed
 */
TaskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  const now = new Date();
  return this.status !== "Completed" && this.status !== "Done" && now > this.dueDate;
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
 * Method: change status safely (with validations)
 */
TaskSchema.methods.changeStatus = function (newStatus) {
  const allowedStatuses = ["To Do", "In Progress", "Review", "Completed", "Blocked"];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid status transition");
  }
  this.status = newStatus;
  return this.status;
};

/**
 * Method: change state safely (with validations) - for backward compatibility
 */
TaskSchema.methods.changeState = function (newState) {
  const allowedStates = ["New", "In Progress", "Blocked", "Done"];
  if (!allowedStates.includes(newState)) {
    throw new Error("Invalid state transition");
  }
  this.state = newState;
  // Sync status
  const stateToStatusMap = {
    New: "To Do",
    "In Progress": "In Progress",
    Blocked: "Blocked",
    Done: "Completed",
  };
  if (stateToStatusMap[newState]) {
    this.status = stateToStatusMap[newState];
  }
  return this.state;
};

export default mongoose.model("Task", TaskSchema);
