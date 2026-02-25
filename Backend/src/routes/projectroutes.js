const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createProject,
  getProjects,
  getProjectDetail,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  getProjectTeam,
} = require("../controllers/projectcontroller");

/* Admin only create */
router.post("/", auth, role(["admin"]), createProject);

/* All logged users can view */
router.get("/", auth, getProjects);

/* Get specific project with team details */
router.get("/:projectId", auth, getProjectDetail);

/* TEAM MANAGEMENT - ADMIN ONLY */

/* Add team member to project */
router.post(
  "/:projectId/team",
  auth,
  role(["admin"]),
  addTeamMember
);

/* Get project team */
router.get("/:projectId/team", auth, getProjectTeam);

/* Update team member role */
router.put(
  "/:projectId/team/:userId",
  auth,
  role(["admin"]),
  updateTeamMemberRole
);

/* Remove team member from project */
router.delete(
  "/:projectId/team/:userId",
  auth,
  role(["admin"]),
  removeTeamMember
);

module.exports = router;

