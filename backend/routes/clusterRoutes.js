const express = require('express');
const router = express.Router();
const Cluster = require('../models/Cluster');
const clusteringService = require('../services/clusteringService');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Route 1: POST /api/clusters/recompute
// Protection: Admin only
router.post('/recompute', authMiddleware, requireRole("Admin"), async (req, res) => {
    try {
        const { force } = req.body;

        if (!force) {
            // Check if clustering was done recently (within last 1 hour)
            const latestCluster = await Cluster.findOne().sort({ lastRecomputedAt: -1 });
            if (latestCluster && latestCluster.lastRecomputedAt) {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                if (latestCluster.lastRecomputedAt > oneHourAgo) {
                    return res.status(400).json({
                        success: false,
                        message: "Clustering was already recomputed recently. Use { \"force\": true } to override.",
                        lastRecomputedAt: latestCluster.lastRecomputedAt
                    });
                }
            }
        }

        const result = await clusteringService.recomputeClusters();
        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error during recompute", error: error.message });
    }
});

// Route 2: GET /api/clusters
// Protection: Admin, Aggregator
router.get('/', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { sector, state, minMembers, limit = 50, sort = "name" } = req.query;

        const query = {};
        if (sector) query.sector = sector;
        if (state) query.state = state;
        if (minMembers) query.memberCount = { $gte: parseInt(minMembers) };

        let sortOption = {};
        if (sort === "members") {
            sortOption = { memberCount: -1 };
        } else {
            sortOption = { clusterName: 1 };
        }

        const clusters = await Cluster.find(query)
            .sort(sortOption)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            totalClusters: clusters.length,
            data: clusters
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching clusters", error: error.message });
    }
});

// Route 3: GET /api/clusters/:id
// Protection: Admin, Aggregator
router.get('/:id', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const cluster = await Cluster.findById(req.params.id).populate("members", "msmeName sector industrySector state");
        if (!cluster) {
            return res.status(404).json({ success: false, message: "Cluster not found" });
        }

        return res.status(200).json({
            success: true,
            data: cluster
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching cluster details", error: error.message });
    }
});

// Route 4: GET /api/clusters/:id/members
// Protection: Admin, Aggregator
router.get('/:id/members', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const result = await clusteringService.getClusterMetrics(req.params.id);
        if (!result.success) {
            return res.status(404).json(result);
        }

        let members = result.data.members;
        const { sort = "baseline", limit = 50 } = req.query;

        // Sorting
        if (sort === "name") {
            members.sort((a, b) => a.msmeName.localeCompare(b.msmeName));
        } else {
            // default baseline DESC
            members.sort((a, b) => b.baseline - a.baseline);
        }

        // Limit
        members = members.slice(0, parseInt(limit));

        return res.status(200).json({
            success: true,
            clusterName: result.data.clusterName,
            memberCount: result.data.memberCount,
            data: members
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching cluster members", error: error.message });
    }
});

// Route 5: GET /api/clusters/:id/metrics
// Protection: Admin, Aggregator
router.get('/:id/metrics', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const result = await clusteringService.getClusterMetrics(req.params.id);
        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching cluster metrics", error: error.message });
    }
});

// Route 6: GET /api/clusters/sector/:sector
// Protection: Admin, Aggregator
router.get('/sector/:sector', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const sector = req.params.sector;
        const clusters = await Cluster.find({ sector });

        // Group by state
        const groupedByState = {};
        clusters.forEach(cluster => {
            if (!groupedByState[cluster.state]) {
                groupedByState[cluster.state] = [];
            }
            groupedByState[cluster.state].push({
                clusterName: cluster.clusterName,
                memberCount: cluster.memberCount,
                _id: cluster._id
            });
        });

        const statesArray = Object.keys(groupedByState).map(state => ({
            state,
            clusters: groupedByState[state]
        }));

        return res.status(200).json({
            success: true,
            sector: sector,
            states: statesArray
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching by sector", error: error.message });
    }
});

module.exports = router;
