import express from "express";
import User from "../models/User.js";
import History from "../models/History.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// All routes in this file require admin access
router.use(authMiddleware("admin"));

// Admin analytics stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await History.countDocuments();

    // Get recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role createdAt");

    // Get recent uploads (last 20)
    const recentUploads = await History.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "name email");

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyUploads = await History.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    const weeklyUsers = await User.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalUploads,
        weeklyUploads,
        weeklyUsers,
        recentUsers,
        recentUploads,
        avgUploadsPerUser:
          totalUsers > 0 ? Number((totalUploads / totalUsers).toFixed(1)) : 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch admin statistics" });
  }
});

// Get all users with pagination and filtering
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email role status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// Get all uploads
router.get("/uploads", async (req, res) => {
  try {
    const uploads = await History.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: uploads,
    });
  } catch (error) {
    console.error("Get uploads error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch uploads" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent deleting other admins (optional security measure)
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);
    // Also delete user's upload history
    await History.deleteMany({ user: id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// Delete upload record
router.delete("/uploads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await History.findByIdAndDelete(id);
    if (!upload) {
      return res
        .status(404)
        .json({ success: false, error: "Upload not found" });
    }

    res.json({ success: true, message: "Upload record deleted successfully" });
  } catch (error) {
    console.error("Delete upload error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete upload record" });
  }
});

// Update user role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("name email role status");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update user role" });
  }
});

// Update user status (activate/deactivate)
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot change your own status" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("name email role status");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      message: `User ${
        status === "active" ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update user status" });
  }
});

// Get user details with their upload history
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Get user's upload history
    const uploads = await History.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10);

    const uploadCount = await History.countDocuments({ user: id });

    res.json({
      success: true,
      data: {
        user,
        uploads,
        uploadCount,
        lastLogin: user.updatedAt, // Using updatedAt as proxy for last activity
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user details" });
  }
});

export default router;
