const mongoose = require("mongoose");
const Bug = require("../models/bug");
const Project = require("../models/Project");
const User = require("../models/user");

/* =========================================
   ADMIN: ASSIGN PROJECT TO BUG
========================================= */
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


/* =========================================
   TESTER: CREATE BUG (Auto Functional Assign)
========================================= */
exports.createBug = async (req, res) => {
  try {
    const { title, description, projectId, severity, bugType } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({
        message: "Title, description and project required",
      });
    }

    const project = await Project.findById(projectId)
      .populate("team.userId", "_id name email role");

    if (!project) {
      return res.status(400).json({
        message: "Project not found",
      });
    }

    // Map bug type → functional team role
    const bugTypeToRoleMap = {
      UI: "UI Designer",
      Backend: "Backend Developer",
      Database: "Database Administrator",
      DevOps: "DevOps Engineer",
      QA: "QA Lead",
      Other: null,
    };

    const targetRole = bugTypeToRoleMap[bugType] || null;

    let assignedMember = null;

    if (targetRole) {
      assignedMember = project.team.find(
        (member) => member.role === targetRole
      );
    }

    // fallback if no matching role
    if (!assignedMember && project.team.length > 0) {
      assignedMember = project.team[0];
    }

    const bugData = {
      title,
      description,
      project: projectId,
      severity: severity || "medium",
      bugType: bugType || "Other",
      createdBy: req.user.id,
      status: "assigned",
    };

    if (assignedMember) {
      bugData.assignedTo = assignedMember.userId._id;
    }

    const bug = await Bug.create(bugData);

    const populatedBug = await bug.populate([
      { path: "project" },
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email role" },
    ]);

    res.status(201).json({
      message: `Bug created and assigned to ${
        assignedMember ? assignedMember.role : "project team"
      }`,
      bug: populatedBug,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================================
   ADMIN / VIEWER: VIEW ALL BUGS
========================================= */
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


/* =========================================
   ADMIN: MANUAL ASSIGN BUG
========================================= */
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


/* =========================================
   DEVELOPER: VIEW ONLY OWN ASSIGNED BUGS
========================================= */
exports.getAssignedBugs = async (req, res) => {
  try {
    const developerId = req.user.id;

    const bugs = await Bug.find({ assignedTo: developerId })
      .populate("project")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json(bugs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================================
   DEVELOPER: UPDATE BUG STATUS
========================================= */
exports.updateStatus = async (req, res) => {
  try {
    const { bugId, status } = req.body;

    if (!bugId || !status) {
      return res.status(400).json({
        message: "bugId and status required",
      });
    }

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    if (!bug.assignedTo || bug.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this bug",
      });
    }

    bug.status = status;
    await bug.save();

    res.json({
      message: "Status updated successfully",
      bug,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================================
   ADMIN: DELETE BUG
========================================= */
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