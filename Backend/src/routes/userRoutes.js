const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const authOptional = require("../middleware/authOptional");

const {
  createUserByAdmin,
  getUsersByRole,
  updateUserRole,
  deactivateUser,
} = require("../controllers/userController");

// 🔐 First admin bootstrap OR admin-only
router.post("/", authOptional, createUserByAdmin);

// 🔐 Admin only routes
router.get("/", auth, role(["admin"]), getUsersByRole);
router.put("/role", auth, role(["admin"]), updateUserRole);
router.put("/deactivate", auth, role(["admin"]), deactivateUser);

module.exports = router;
