const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { assignProject } = require("../controllers/bugcontroller");


const {
  createBug,
  getAllBugs,
  assignBug,
  getAssignedBugs,
  updateStatus,
  deleteBug,
} = require("../controllers/bugcontroller"); //

// Tester creates bug
router.post("/", auth, role(["tester"]), createBug);

// Admin views all bugs
router.get("/", auth, role(["admin", "viewer"]), getAllBugs);

// Admin assigns bug
router.post("/assign", auth, role(["admin"]), assignBug);

// Developer views assigned bugs
router.get("/assigned", auth, role(["developer"]), getAssignedBugs);

// Developer updates bug status
router.put("/status", auth, role(["developer"]), updateStatus);

// Admin deletes bug
router.delete("/:id", auth, role(["admin"]), deleteBug);

router.post("/assign-project", auth, role(["admin"]), assignProject);

module.exports = router;
