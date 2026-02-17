const Project = require("../models/Project");

/* =============================
   ADMIN: CREATE PROJECT
============================= */
exports.createProject = async (req, res) => {
  try {
    const { projectId, projectName, description } = req.body;

    if (!projectId || !projectName) {
      return res.status(400).json({
        message: "Project ID and Name are required",
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
    const projects = await Project.find().populate("createdBy", "name email");
    res.json(projects);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
