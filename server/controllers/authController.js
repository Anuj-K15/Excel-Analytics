// controllers/authController.js
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_UPLOAD_PASSWORD = process.env.ADMIN_UPLOAD_PASSWORD;
console.log("JWT_SECRET:", JWT_SECRET);

// Register
export const registerUser = async (req, res) => {
  const { name, email, password, role, adminCode } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    // Verify admin code if attempting to register as admin
    if (role === "admin" && adminCode !== ADMIN_UPLOAD_PASSWORD) {
      return res.status(401).json({
        msg: "Invalid admin code",
        requiresAdminCode: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow admin role if admin code is correct
    const userRole =
      role === "admin" && adminCode === ADMIN_UPLOAD_PASSWORD
        ? "admin"
        : "user";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
