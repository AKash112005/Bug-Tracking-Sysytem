require("dotenv").config();
console.log("MONGO_URI =", process.env.MONGO_URI);
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();   // now this WILL work

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
