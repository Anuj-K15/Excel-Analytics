// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import {
  googleAuthCallback,
  verifyAdminCode,
} from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuthCallback);
router.post("/verify-admin-code", verifyAdminCode);

export default router;
