import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

// User can view their own profile
router.get("/me", authMiddleware(), (req, res) => {
  res.json(req.user);
});

// Admin can view all users
router.get("/", authMiddleware("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export default router;
