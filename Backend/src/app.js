const express = require("express");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE FIRST
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES (ONCE ONLY)
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/bugs", require("./routes/bugroutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("Bug Tracking System API Running");
});

module.exports = app;
