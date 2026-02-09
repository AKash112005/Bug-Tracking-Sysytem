const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createUserByAdmin,
  getUsersByRole,
  updateUserRole,
  deactivateUser
} = require("../controllers/userController");

// Admin only routes
router.post("/", auth, role(["admin"]), createUserByAdmin);
router.get("/", auth, role(["admin"]), getUsersByRole);
router.put("/role", auth, role(["admin"]), updateUserRole);
router.put("/deactivate", auth, role(["admin"]), deactivateUser);

module.exports = router;
