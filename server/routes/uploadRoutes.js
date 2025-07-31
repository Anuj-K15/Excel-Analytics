import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter for Excel files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Process Excel file
const processExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error("Failed to process Excel file");
  } finally {
    // Clean up: delete the uploaded file after processing
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};

// Excel Upload Endpoint
router.post(
  "/excel",
  authMiddleware(),
  upload.single("excelFile"),
  async (req, res) => {
    try {
      console.log("Upload request from:", req.user.email);
      console.log("File received:", req.file?.originalname);
      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Admin-specific checks (disabled for development)
      // if (req.user.role === 'admin') {
      //   if (!req.body.uploadPassword || req.body.uploadPassword !== process.env.ADMIN_UPLOAD_PASSWORD) {
      //     return res.status(403).json({ error: 'Admin password required' });
      //   }
      // }

      // Process the Excel file
      // Process file (common for both roles)
      const data = await processExcel(req.file.path);
      res.json({
        success: true,
        data,
        message:
          req.user.role === "admin"
            ? "Admin upload successful"
            : "Upload successful",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// File Delete Endpoint (Admin only)
router.delete("/excel/:id", authMiddleware("admin"), async (req, res) => {
  try {
    // Implement your file deletion logic here
    // Example: delete from database or filesystem
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete file",
    });
  }
});

export default router;
