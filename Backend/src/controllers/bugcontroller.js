const mongoose = require("mongoose");
const Bug = require("../models/bug");

exports.assignProject = async (req, res) => {
  try {
    const { bugId, projectId } = req.body;

    if (!bugId || !projectId) {
      return res.status(400).json({ message: "BugId & ProjectId required" });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    bug.project = projectId;
    await bug.save();

    res.json({ message: "Project assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  //  Tester: Create Bug

exports.createBug = async (req, res) => {
  try {
    const { title, description, project } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const bug = await Bug.create({
      title,
      description,
      project, 
      createdBy: req.user.id,
      status: "open",
      assignedTo: null,
      
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  //  Admin / Viewer: View All Bugs

exports.getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("project") 
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  //  Admin: Assign Bug

exports.assignBug = async (req, res) => {
  try {
    const { bugId, developerId } = req.body;

    if (!bugId || !developerId) {
      return res.status(400).json({
        message: "BugId and DeveloperId required",
      });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    bug.assignedTo = developerId;
    bug.status = "assigned"; 

    await bug.save();

    res.json({ message: "Bug assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  //  Developer: View Assigned Bugs

exports.getAssignedBugs = async (req, res) => {
  try {
    const developerId = new mongoose.Types.ObjectId(req.user.id);

    const bugs = await Bug.find({ assignedTo: developerId })
      .populate("project") // ✅ show project info
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  //  Developer: Update Bug Status

exports.updateStatus = async (req, res) => {
  try {
    const { bugId, status } = req.body;

    if (!bugId || !status) {
      return res.status(400).json({
        message: "bugId and status are required",
      });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    if (!bug.assignedTo || bug.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not your assigned bug",
      });
    }

    bug.status = status;
    await bug.save();

    res.json({ message: "Status updated", bug });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//  Admin :delete Bugs
exports.deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    await bug.deleteOne();

    res.json({ message: "Bug deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
