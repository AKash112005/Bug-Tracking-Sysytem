const mongoose = require("mongoose");
const Bug = require("../models/bug");

/* ============================
   Tester: Create Bug
============================ */
exports.createBug = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const bug = await Bug.create({
      title,
      description,
      createdBy: req.user.id,
      status: "open",
      assignedTo: null,
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   Admin: View All Bugs
============================ */
exports.getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("createdBy", "email role")
      .populate("assignedTo", "email role");

    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   Admin: Assign Bug to Developer
============================ */
exports.assignBug = async (req, res) => {
  try {
    console.log("🔥 ASSIGN BUG HIT");
    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { bugId, developerId } = req.body;

    const bug = await Bug.findById(bugId);
    console.log("BUG FOUND:", bug);

    bug.assignedTo = developerId;
    bug.status = "assigned";

    await bug.save();

    res.json({ message: "Bug assigned successfully" });
  } catch (error) {
    console.error("❌ ASSIGN BUG ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   Developer: View Assigned Bugs
============================ */
exports.getAssignedBugs = async (req, res) => {
  try {
    const developerId = new mongoose.Types.ObjectId(req.user.id);

    const bugs = await Bug.find({ assignedTo: developerId })
      .populate("createdBy", "email")
      .populate("assignedTo", "email");

    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   Developer: Update Bug Status
============================ */
exports.updateStatus = async (req, res) => {
  try {
    const { bugId, status } = req.body;

    if (!bugId || !status) {
      return res
        .status(400)
        .json({ message: "bugId and status are required" });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    if (!bug.assignedTo || bug.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your assigned bug" });
    }

    bug.status = status;
    await bug.save();

    res.json({ message: "Status updated", bug });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignBug = async (req, res) => {
  try {
    const { bugId, developerId } = req.body;

    if (!bugId || !developerId) {
      return res.status(400).json({ message: "BugId and DeveloperId required" });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    bug.assignedTo = developerId;
    bug.status = "assigned"; // ✅ MUST MATCH ENUM

    await bug.save();

    res.json({ message: "Bug assigned successfully" });
  } catch (err) {
    console.error("ASSIGN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

