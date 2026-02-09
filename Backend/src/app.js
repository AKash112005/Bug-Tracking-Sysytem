const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bug Tracking System API Running");
});


app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/bugs", require("./routes/bugroutes"));
app.use("/api/users", require("./routes/userRoutes"));

module.exports = app;
