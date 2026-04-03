const express = require('express');
const router = express.Router();
const Verifier = require('../models/Verifier');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/verifiers
// @desc    Get all Verifiers
// @access  Private (Admin only)
router.get('/', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        // Find all Verifiers and populate associated User login info
        const verifiers = await Verifier.find().populate('user', 'name email role');
        res.json(verifiers);
    } catch (error) {
        console.error("Error fetching Verifiers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/verifiers/:id
// @desc    Get Verifier by ID
// @access  Private (Admin only)
router.get('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        const verifier = await Verifier.findById(req.params.id).populate('user', 'name email role');
        if (!verifier) {
            return res.status(404).json({ message: "Verifier not found" });
        }
        res.json(verifier);
    } catch (error) {
        console.error("Error fetching Verifier by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/verifiers/by-expertise/:expertise
// @desc    Get Verifier by Expertise Area
// @access  Private (Admin, Aggregator)
router.get('/by-expertise/:expertise', authMiddleware, requireRole('Admin', 'Aggregator'), async (req, res) => {
    try {
        const expertiseArea = req.params.expertise;
        // Search verifiers utilizing the parameter
        const verifiers = await Verifier.find({ areaOfExpertise: expertiseArea }).populate('user', 'name email role');
        res.json(verifiers);
    } catch (error) {
        console.error("Error fetching Verifiers by expertise:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
