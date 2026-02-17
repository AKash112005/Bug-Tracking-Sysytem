const express = require("express");
const cors = require("cors");

const app = express(); // ✅ CREATE APP FIRST

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/bugs", require("./routes/bugroutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectroutes")); // ✅ after app init

// Test route
app.get("/", (req, res) => {
  res.send("Bug Tracking System API Running");
});

module.exports = app;
