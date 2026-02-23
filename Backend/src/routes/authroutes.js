const express = require("express");
const router = express.Router();

// IMPORTANT: exact path + exact file name
const AuthController = require("../controllers/AuthController");

// SAFETY CHECK (TEMP – REMOVE LATER)
if (!AuthController.login) {
  throw new Error("AuthController.login is undefined");
}

router.post("/login", AuthController.login);

module.exports = router;
