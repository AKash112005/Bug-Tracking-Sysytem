const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createProject,
  getProjects,
} = require("../controllers/projectcontroller");

/* Admin only create */
router.post("/", auth, role(["admin"]), createProject);

/* All logged users can view */
router.get("/", auth, getProjects);

module.exports = router;
