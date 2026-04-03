const express = require('express');
const router = express.Router();
const MSME = require('../models/MSME');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/msmes
// @desc    Get all MSMEs
// @access  Private (Admin, Aggregator)
router.get('/', authMiddleware, requireRole('Admin', 'Aggregator'), async (req, res) => {
    try {
        // Find all MSMEs and populate basic user info 
        const msmes = await MSME.find().populate('user', 'name email role');
        res.json(msmes);
    } catch (error) {
        console.error("Error fetching MSMEs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/msmes/:id
// @desc    Get MSME by ID
// @access  Private (Admin, Aggregator)
router.get('/:id', authMiddleware, requireRole('Admin', 'Aggregator'), async (req, res) => {
    try {
        const msme = await MSME.findById(req.params.id).populate('user', 'name email role');
        if (!msme) {
            return res.status(404).json({ message: "MSME not found" });
        }
        res.json(msme);
    } catch (error) {
        console.error("Error fetching MSME by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
