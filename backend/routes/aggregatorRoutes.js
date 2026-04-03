const express = require('express');
const router = express.Router();
const Aggregator = require('../models/Aggregator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/aggregators
// @desc    Get all Aggregators
// @access  Private (Admin only)
router.get('/', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        // Find all Aggregators and populate user info
        const aggregators = await Aggregator.find().populate('user', 'name email role');
        res.json(aggregators);
    } catch (error) {
        console.error("Error fetching Aggregators:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/aggregators/:id
// @desc    Get Aggregator by ID
// @access  Private (Admin only)
router.get('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        const aggregator = await Aggregator.findById(req.params.id).populate('user', 'name email role');
        if (!aggregator) {
            return res.status(404).json({ message: "Aggregator not found" });
        }
        res.json(aggregator);
    } catch (error) {
        console.error("Error fetching Aggregator by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
