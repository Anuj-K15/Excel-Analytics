// controllers/googleAuthController.js
import dotenv from "dotenv";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_UPLOAD_PASSWORD = process.env.ADMIN_UPLOAD_PASSWORD;

// Verify admin code before starting Google auth
export const verifyAdminCode = async (req, res) => {
  const { adminCode } = req.body;

  try {
    if (!adminCode || adminCode !== ADMIN_UPLOAD_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin code",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin code verified",
    });
  } catch (err) {
    console.error("Admin code verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

export const googleAuthCallback = async (req, res) => {
  const { name, email, uid, photoURL, requestedRole, adminCode } = req.body;

  try {
    // Check if admin code is required but invalid
    if (requestedRole === "admin" && adminCode !== ADMIN_UPLOAD_PASSWORD) {
      return res.status(401).json({
        msg: "Invalid admin code",
        requiresAdminCode: true,
      });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have google as auth provider,
      // update their profile to include Google authentication
      if (!user.authProvider) {
        user.authProvider = "google";
        user.providerUID = uid;
        user.photoURL = photoURL;
        // Only update role if admin code is correct
        if (requestedRole === "admin" && adminCode === ADMIN_UPLOAD_PASSWORD) {
          user.role = "admin";
        }
        await user.save();
      }
    } else {
      // Create a new user with the requested role
      // Only allow admin role if admin code is correct
      const role =
        requestedRole === "admin" && adminCode === ADMIN_UPLOAD_PASSWORD
          ? "admin"
          : "user";

      user = await User.create({
        name,
        email,
        authProvider: "google",
        providerUID: uid,
        photoURL,
        role,
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
