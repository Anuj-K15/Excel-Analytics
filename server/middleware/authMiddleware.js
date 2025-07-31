import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = (requiredRole = "user") => {
  return async (req, res, next) => {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authorization token required",
      });
    }
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get fresh user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "User not found or token invalid",
        });
      }

      // Check if user is active (optional)
      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          msg: "Account is not active",
        });
      }

      // Role-based authorization
      if (requiredRole) {
        if (requiredRole === "user") {
          // Allow both 'user' and 'admin' roles
          if (user.role !== "user" && user.role !== "admin") {
            return res.status(403).json({
              success: false,
              msg: "Insufficient privileges",
            });
          }
        } else if (user.role !== requiredRole) {
          return res.status(403).json({
            success: false,
            msg: "Insufficient privileges",
          });
        }
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (err) {
      console.error("JWT Error:", err.message);

      let errorMsg = "Invalid token";
      if (err.name === "TokenExpiredError") {
        errorMsg = "Token expired";
      } else if (err.name === "JsonWebTokenError") {
        errorMsg = "Malformed token";
      }

      res.status(401).json({
        success: false,
        msg: errorMsg,
      });
    }
  };
};
