const express = require('express');
const router = express.Router();
const InviteCode = require('../models/InviteCode');
const Admin = require('../models/Admin');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// @route   POST /api/admin/generate-invite-code
// @desc    Generate a new Admin invite code
// @access  Private (Admin only)
router.post('/generate-invite-code', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        const { expiresInDays } = req.body;
        const days = expiresInDays || 30; // default 30 days

        // Generate a random 8-digit numeric code
        let newCode = "";
        let isUnique = false;

        while (!isUnique) {
            newCode = Math.floor(10000000 + Math.random() * 90000000).toString();
            const existingCode = await InviteCode.findOne({ code: newCode });
            if (!existingCode) {
                isUnique = true;
            }
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        // Create InviteCode document
        const inviteCode = new InviteCode({
            code: newCode,
            isUsed: false,
            expiresAt,
            createdBy: req.user.id // The admin calling this endpoint
        });

        await inviteCode.save();

        res.status(201).json({
            code: inviteCode.code,
            expiresAt: inviteCode.expiresAt,
            createdAt: inviteCode.createdAt
        });

    } catch (error) {
        console.error("Error generating invite code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/admin/all-admins
// @desc    Get a list of all administrators
// @access  Private (Admin only)
router.get('/all-admins', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        // Find all Admins and populate associated User login info
        const admins = await Admin.find().populate('user', 'name email role');
        res.json(admins);
    } catch (error) {
        console.error("Error fetching Admins:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/admin/invite-codes
// @desc    Get a list of all invite codes (used and unused) for audit
// @access  Private (Admin only)
router.get('/invite-codes', authMiddleware, requireRole('Admin'), async (req, res) => {
    try {
        const codes = await InviteCode.find()
            .populate('createdBy', 'name email role')
            .populate('usedBy', 'name email role');
        res.json(codes);
    } catch (error) {
        console.error("Error fetching invite codes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
