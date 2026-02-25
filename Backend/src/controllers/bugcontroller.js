const mongoose = require("mongoose");
const Bug = require("../models/bug");
const Project = require("../models/Project");
const User = require("../models/user");

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
    const { title, description, projectId, severity, bugType } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({
        message: "Title, description and project required",
      });
    }

    // Find the project to get team members
    const project = await Project.findById(projectId)
      .populate("team.userId", "_id name email role");

    if (!project) {
      return res.status(400).json({
        message: "Project not found",
      });
    }

    // Map bug types to team roles
    const bugTypeToRoleMap = {
      UI: "UI Designer",
      Backend: "Backend Developer",
      Database: "Database Administrator",
      DevOps: "DevOps Engineer",
      QA: "QA Lead",
      Other: null,
    };

    // Get the target role for this bug type
    const targetRole = bugTypeToRoleMap[bugType] || null;

    // Find team member with matching role
    let assignedMember = null;

    if (targetRole) {
      assignedMember = project.team.find(
        (member) => member.role === targetRole
      );
    }

    // Fallback: assign to first team member if no role match
    if (!assignedMember && project.team.length > 0) {
      assignedMember = project.team[0];
    }

    // Prepare bug data
    const bugData = {
      title,
      description,
      project: projectId,
      severity: severity || "medium",
      bugType: bugType || "Other",
      createdBy: req.user.id,
      status: "assigned",
      assignedToTeam: true,
    };

    // Assign to matched or first team member
    if (assignedMember) {
      bugData.assignedTo = assignedMember.userId._id;
    }

    const bug = await Bug.create(bugData);

    // Populate response
    const populatedBug = await bug.populate([
      { path: "project" },
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email role" },
    ]);

    res.status(201).json({
      message: `Bug created and auto-assigned to ${
        assignedMember ? assignedMember.role : "project team"
      }`,
      bug: populatedBug,
    });
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

    // Get all bugs directly assigned
    const directlyAssignedBugs = await Bug.find({ assignedTo: developerId })
      .populate("project")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    // Get all bugs assigned to project teams where developer is a member
    const teamAssignedBugs = await Bug.find({ assignedToTeam: true })
      .populate("project")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    // Filter team-assigned bugs to only those where developer is on the project team
    const filteredTeamBugs = [];
    for (const bug of teamAssignedBugs) {
      if (bug.project?.team) {
        const isTeamMember = bug.project.team.some(
          (member) => member.userId.toString() === developerId.toString()
        );
        if (isTeamMember) {
          filteredTeamBugs.push(bug);
        }
      }
    }

    // Combine both and remove duplicates
    const allBugs = [...directlyAssignedBugs, ...filteredTeamBugs];
    const uniqueBugIds = new Set();
    const uniqueBugs = allBugs.filter((bug) => {
      if (uniqueBugIds.has(bug._id.toString())) {
        return false;
      }
      uniqueBugIds.add(bug._id.toString());
      return true;
    });

    res.json(uniqueBugs);
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

    const bug = await Bug.findById(bugId).populate("project");
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const developerId = req.user.id;

    let isAllowed = false;

    // ✅ Case 1: Direct assignment
    if (bug.assignedTo && bug.assignedTo.toString() === developerId) {
      isAllowed = true;
    }

    // ✅ Case 2: Team-based assignment
    if (!isAllowed && bug.assignedToTeam && bug.project?.team) {
      const isTeamMember = bug.project.team.some(
        (member) => member.userId.toString() === developerId
      );

      if (isTeamMember) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return res.status(403).json({
        message: "Not authorized to update this bug",
      });
    }

    bug.status = status;
    await bug.save();

    res.json({ message: "Status updated successfully", bug });
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
