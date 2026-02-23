const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createUserByAdmin,
  getUsersByRole,
  updateUserRole,
  deactivateUser,
  deleteUser,
  resetUserPassword
} = require("../controllers/userController");

// ✅ ADMIN ONLY
router.post("/", auth, role(["admin"]), createUserByAdmin);
router.get("/", auth, role(["admin"]), getUsersByRole);
router.put("/role", auth, role(["admin"]), updateUserRole);
router.put("/deactivate", auth, role(["admin"]), deactivateUser);
router.delete("/:userId", auth, role(["admin"]), deleteUser);
router.put("/:userId/password", auth, role(["admin"]), resetUserPassword);

module.exports = router;
