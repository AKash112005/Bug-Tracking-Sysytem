const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["admin", "developer", "tester", "viewer"],
      default: "tester",
    },
  },
  { timestamps: true }
);

/**
 * ✅ Prevent OverwriteModelError
 * If model already exists, reuse it
 */
module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
