const Project = require("../models/Project");

/* =============================
   ADMIN: CREATE PROJECT
============================= */
exports.createProject = async (req, res) => {
  try {
    const { projectId, projectName, description } = req.body;

    if (!projectId || !projectName) {
      return res.status(400).json({
        message: "Project ID and Project Name are required",
      });
    }

    const exists = await Project.findOne({ projectId });
    if (exists) {
      return res.status(400).json({
        message: "Project ID already exists",
      });
    }

    const project = await Project.create({
      projectId,
      projectName,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   GET ALL PROJECTS
============================= */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .populate("team.userId", "name email role")
      .populate("team.addedBy", "name");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =============================
   GET PROJECT BY ID
============================= */
exports.getProjectDetail = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("createdBy", "name email")
      .populate("team.userId", "name email role")
      .populate("team.addedBy", "name");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   ADD TEAM MEMBER
============================= */
exports.addTeamMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        message: "User ID and functional role are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent duplicate team member
    const alreadyExists = project.team.some(
      (member) => member.userId.toString() === userId
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: "User is already a team member",
      });
    }

    project.team.push({
      userId,
      role,
      addedBy: req.user.id,
      addedDate: new Date(),
    });

    await project.save();

    await project.populate("team.userId", "name email role");
    await project.populate("team.addedBy", "name");

    res.status(201).json({
      message: "Team member added successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   REMOVE TEAM MEMBER
============================= */
exports.removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.team = project.team.filter(
      (member) => member.userId.toString() !== userId
    );

    await project.save();

    await project.populate("team.userId", "name email role");
    await project.populate("team.addedBy", "name");

    res.json({
      message: "Team member removed successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   UPDATE TEAM MEMBER ROLE
============================= */
exports.updateTeamMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        message: "Functional role is required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const teamMember = project.team.find(
      (member) => member.userId.toString() === userId
    );

    if (!teamMember) {
      return res.status(404).json({
        message: "Team member not found in this project",
      });
    }

    teamMember.role = role;
    await project.save();

    await project.populate("team.userId", "name email role");
    await project.populate("team.addedBy", "name");

    res.json({
      message: "Team member role updated successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   GET PROJECT TEAM
============================= */
exports.getProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "team.userId",
      "name email role"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};