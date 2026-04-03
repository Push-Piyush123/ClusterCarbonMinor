const express = require('express');
const router = express.Router();
const EmissionSummary = require('../models/EmissionSummary');
const MSME = require('../models/MSME');
const { calculateClusterEmissions, getEmissionStatus, getClusterEmissionSummary, getDashboardMetrics } = require('../services/emissionCalculationService');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Route 1: POST /api/emissions/calculate
router.post('/calculate', authMiddleware, requireRole("Admin"), async (req, res) => {
    try {
        const { clusterId, periodStart, periodEnd, periodLabel } = req.body;
        
        if (!clusterId || !periodStart || !periodEnd || !periodLabel) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const start = new Date(periodStart);
        const end = new Date(periodEnd);

        if (start > end) {
            return res.status(400).json({ success: false, error: "Period end date must be after start date" });
        }
        if (start > new Date() || end > new Date()) {
            return res.status(400).json({ success: false, error: "Period dates cannot be in the future" });
        }

        const result = await calculateClusterEmissions(clusterId, periodStart, periodEnd, periodLabel);

        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }

        return res.status(201).json({
            success: true,
            message: "Emissions calculated successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error", message: error.message });
    }
});

// Route 2: GET /api/emissions/cluster/:clusterId
router.get('/cluster/:clusterId', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { period, status, limit = 50, sort = "creditsIssued" } = req.query;
        const query = { cluster: req.params.clusterId };

        if (period) query.period = period;
        if (status) query.status = status;

        let sortOption = {};
        if (sort === "reduction") sortOption = { emissionReduction: -1 };
        else sortOption = { creditsIssued: -1 }; // default creditsIssued desc

        const summaries = await EmissionSummary.find(query)
            .sort(sortOption)
            .limit(parseInt(limit))
            .populate("msme");

        if (!summaries || summaries.length === 0) {
            return res.status(200).json({
                success: true,
                clusterId: req.params.clusterId,
                totalRecords: 0,
                data: []
            });
        }

        const data = summaries.map(s => ({
            _id: s._id,
            msmeId: s.msme ? s.msme._id : null,
            msmeName: s.msme ? s.msme.msmeName : "Unknown",
            period: s.period,
            baselineConsumption: s.baselineConsumption,
            monitoringConsumption: s.monitoringConsumption,
            emissionReduction: s.emissionReduction,
            reductionPercentage: s.reductionPercentage,
            msmeContributionPercentage: s.msmeContributionPercentage,
            creditsIssued: s.creditsIssued,
            status: s.status,
            createdAt: s.createdAt
        }));

        // we can grab cluster name from the first document since they belong to the same cluster
        return res.status(200).json({
            success: true,
            clusterId: req.params.clusterId,
            clusterName: summaries[0].cluster ? summaries[0].cluster.clusterName : undefined, // may not be populated
            periodFilter: period,
            totalRecords: data.length,
            data
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error", message: error.message });
    }
});

// Route 3: GET /api/emissions/msme/:msmeId
// Check ownership + requireRole("Admin", "Aggregator", "MSME")
router.get('/msme/:msmeId', authMiddleware, async (req, res) => {
    try {
        // Enforce RBAC
        const allowedRoles = ["Admin", "Aggregator", "MSME"];
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "You do not have permission to perform this action." });
        }

        const msmeId = req.params.msmeId;
        const msme = await MSME.findById(msmeId);
        
        if (!msme) return res.status(404).json({ error: "MSME not found" });

        // If MSME role, strictly enforce ownership
        if (req.user.role === "MSME") {
            if (msme.user.toString() !== req.user.id.toString()) {
                return res.status(403).json({ error: "You do not have permission to view this MSME's data" });
            }
        }

        const result = await getEmissionStatus(msmeId);

        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error", message: error.message });
    }
});

// Route 4: GET /api/emissions/summary
router.get('/summary', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { clusterId, status, startDate, endDate } = req.query;
        const filters = { clusterId, status, startDate, endDate };

        const result = await getDashboardMetrics(filters);

        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Unauthorized: Only Admin and Aggregator can access emissions summary", message: error.message });
    }
});

// Route 5: POST /api/emissions/issue/:clusterId
router.post('/issue/:clusterId', authMiddleware, requireRole("Admin"), async (req, res) => {
    try {
        const { period } = req.body;
        if (!period) return res.status(400).json({ success: false, error: "Period is required" });

        const filterQuery = { cluster: req.params.clusterId, period, status: "Calculated" };
        
        const summariesToIssue = await EmissionSummary.find(filterQuery);
        
        if (summariesToIssue.length === 0) {
            return res.status(404).json({ success: false, message: "No 'Calculated' summaries found for this cluster and period." });
        }

        const totalCreditsIssued = summariesToIssue.reduce((sum, s) => sum + s.creditsIssued, 0);

        await EmissionSummary.updateMany(
            filterQuery,
            { status: "Issued" }
        );

        return res.status(200).json({
            success: true,
            message: "Credits issued successfully",
            clusterId: req.params.clusterId,
            period,
            recordsIssued: summariesToIssue.length,
            totalCreditsIssued
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error", message: error.message });
    }
});

// Route 6: POST /api/emissions/verify/:emissionSummaryId
router.post('/verify/:emissionSummaryId', authMiddleware, requireRole("Verifier"), async (req, res) => {
    try {
        const { verified, comments } = req.body;
        if (!verified) return res.status(400).json({ success: false, error: "Verification required" });

        const summary = await EmissionSummary.findById(req.params.emissionSummaryId).populate('msme');
        if (!summary) return res.status(404).json({ success: false, error: "Emission Summary not found" });

        summary.status = "Verified";
        summary.verifiedBy = req.user.id;
        summary.verifiedAt = Date.now();
        // Option to save comments in a new schema field or ignore, prompt didn't specify save destination.
        await summary.save();

        return res.status(200).json({
            success: true,
            message: "Emission record verified",
            data: {
                _id: summary._id,
                msme: summary.msme ? summary.msme._id : summary.msme,
                msmeName: summary.msme ? summary.msme.msmeName : "Unknown",
                creditsIssued: summary.creditsIssued,
                status: summary.status,
                verifiedBy: summary.verifiedBy,
                verifiedAt: summary.verifiedAt
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error", message: error.message });
    }
});

module.exports = router;
