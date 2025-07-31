import express from 'express';
import History from '../models/History.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// POST: Save new history
router.post('/', authMiddleware(), async (req, res) => {
  try {
    const { fileName, xAxis, yAxis, chartType } = req.body;

    // Validate required fields
    if (!fileName || !xAxis || !yAxis || !chartType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const history = new History({
      user: req.user._id, // Using _id for consistency
      fileName,
      xAxis,
      yAxis,
      chartType
    });

    await history.save();
    
    res.status(201).json({ 
      success: true,
      message: 'History saved successfully',
      data: history.toObject()
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET: Fetch all history for a user
router.get('/', authMiddleware(), async (req, res) => {
  try {
    console.log(`Fetching history for user: ${req.user._id}`);
    
    const history = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v -user') // Excluding version key and user field
      .lean(); // Convert to plain JS object

    console.log(`Found ${history.length} records for user ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin-only route
router.get('/admin/all', authMiddleware('admin'), async (req, res) => {
  try {
    const allHistory = await History.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email') // Include user details
      .lean();

    res.status(200).json({
      success: true,
      count: allHistory.length,
      data: allHistory
    });
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all history'
    });
  }
});

export default router;