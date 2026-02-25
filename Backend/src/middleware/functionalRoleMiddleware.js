const Bug = require("../models/bug");
const Project = require("../models/Project");

const bugTypeToRoleMap = {
  UI: "UI Designer",
  Backend: "Backend Developer",
  Database: "Database Administrator",
  DevOps: "DevOps Engineer",
  QA: "QA Lead",
};

module.exports = async (req, res, next) => {
  try {
    const { bugId } = req.body;

    if (!bugId) {
      return res.status(400).json({ message: "BugId required" });
    }

    const bug = await Bug.findById(bugId).populate("project");
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const developerId = req.user.id;

    // Step 1: Must belong to project team
    const teamMember = bug.project?.team?.find(
      (member) => member.userId.toString() === developerId
    );

    if (!teamMember) {
      return res.status(403).json({
        message: "You are not part of this project team",
      });
    }

    // Step 2: Functional role must match bugType
    const requiredRole = bugTypeToRoleMap[bug.bugType];

    if (requiredRole && teamMember.role !== requiredRole) {
      return res.status(403).json({
        message: "You are not responsible for this bug type",
      });
    }

    req.bug = bug; // pass bug to next middleware/controller
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};