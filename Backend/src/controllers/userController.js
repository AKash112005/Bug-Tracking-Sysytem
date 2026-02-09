const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =========================
   ADMIN: CREATE USER
========================= */
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount > 0 && req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can create users",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   ADMIN: GET USERS
========================= */
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    const query = role ? { role: role.trim() } : {};
    const users = await User.find(query).select("-password");

    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   ADMIN: UPDATE USER ROLE
========================= */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "UserId and role required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ADMIN: DEACTIVATE USER
========================= */
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
