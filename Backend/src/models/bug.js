const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    status: {
        type: String,
        enum: ["open", "assigned", "in-progress", "fixed"],
        default: "open",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    bugType: {
      type: String,
      enum: ["UI", "Backend", "Database", "DevOps", "QA", "Other"],
      default: "Other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedToTeam: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Bug || mongoose.model("Bug", bugSchema);