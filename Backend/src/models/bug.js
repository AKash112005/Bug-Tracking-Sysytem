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
        enum: ["open", "assigned", "in-progress", "fixed","assigned"],
        default: "open",
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
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema); //  REQUIRED
module.exports = mongoose.models.Bug || mongoose.model("Bug", bugSchema);