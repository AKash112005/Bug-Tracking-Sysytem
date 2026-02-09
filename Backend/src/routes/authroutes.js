const express = require("express");
const router = express.Router();

const { register, login } = require("../Controllers/AuthController");
const auth = require("../middleware/authMiddleware");

// register
router.post("/register", register);

// login
router.post("/login", login);

// 🔐 PROTECTED ROUTE (THIS WAS MISSING)
router.get("/protected", auth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
  
});

module.exports = router;