const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const RiskScore = require('../models/RiskScore');
const MSME = require('../models/MSME');
const Cluster = require('../models/Cluster');
const BaselineReading = require('../models/BaselineReading');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const {
    getSystemDashboard,
    getClusterReport,
    getMSMEReport,
    getVerificationQueue,
    generateCSVReport,
    generatePDFReport
} = require('../services/reportingService');

// @route   GET /api/dashboard/system-metrics
// @desc    Get system-wide metrics for main dashboard
router.get('/system-metrics', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const metrics = await getSystemDashboard();
        
        let pendingVerificationsCount = 0;
        try {
            pendingVerificationsCount = await Allocation.countDocuments({ status: "Allocated" });
        } catch (e) {
            console.error("Aggregation count fail", e);
        }

        return res.status(200).json({
            success: true,
            data: {
                ...metrics,
                verificationQueueCount: pendingVerificationsCount
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Crashing attempting to fetch structural Dashboard map.", message: error.message });
    }
});

// @route   GET /api/dashboard/cluster/:clusterId
// @desc    Get detailed cluster report
router.get('/cluster/:clusterId', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { period } = req.query;
        const report = await getClusterReport(req.params.clusterId, period);

        if (!report) return res.status(404).json({ success: false, error: "Requested analytics block target cluster not found." });

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
         return res.status(500).json({ success: false, error: "Server error querying detailed targeted cluster analytics." });
    }
});

// @route   GET /api/dashboard/msme/:msmeId
// @desc    Get MSME progress report ensuring strict ownership
router.get('/msme/:msmeId', authMiddleware, async (req, res) => {
    try {
        if (!["Admin", "Aggregator", "MSME"].includes(req.user.role)) {
             return res.status(403).json({ error: "Cannot access core API. Prohibited Role Layer." });
        }

        const msmeId = req.params.msmeId;
        const msmeModel = await MSME.findById(msmeId);
        
        if (!msmeModel) {
            return res.status(404).json({ success: false, message: "MSME not found" });
        }

        // Enforce ownership
        if (req.user.role === "MSME") {
            if (msmeModel.user.toString() !== req.user.id) {
                return res.status(403).json({ error: "Cannot access other MSME reports" });
            }
        }

        const report = await getMSMEReport(msmeId);

        if (report && report.notFound) {
            return res.status(404).json({ success: false, message: "MSME not found" });
        }

        if (report && report.emptyData) {
            return res.status(200).json({
                success: true,
                message: "No data available for this MSME",
                data: {}
            });
        }

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate MSME report",
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/verification-queue
// @desc    List pending verification entries efficiently targeting queue logic
router.get('/verification-queue', authMiddleware, requireRole("Admin", "Verifier"), async (req, res) => {
    try {
        const { limit = 50, status = "Allocated", sortBy = "oldest" } = req.query;
        
        const queue = await getVerificationQueue(limit, status, sortBy);

        return res.status(200).json({
            success: true,
            pendingCount: queue.length,
            data: queue
        });
    } catch (error) {
         return res.status(500).json({ success: false, error: "Verifier queue fetch logic exception." });
    }
});

// @route   GET /api/dashboard/export/csv
// @desc    Download dataset as generated CSV content stream
router.get('/export/csv', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { type, clusterId, msmeId, period } = req.query;
        let dataPack = [];
        let filenameSuffix = "report";

        if (type === "system") {
            const dash = await getSystemDashboard();
            dataPack = [dash];
            filenameSuffix = "system_metrics";
        } else if (type === "cluster" && clusterId) {
            dataPack = (await getClusterReport(clusterId, period))?.members || [];
            filenameSuffix = "cluster_members";
        } else if (type === "msme" && msmeId) {
            dataPack = (await getMSMEReport(msmeId))?.emissions || [];
            filenameSuffix = "msme_emissions";
        } else if (type === "verification-queue") {
            dataPack = await getVerificationQueue(100);
            filenameSuffix = "verifications";
        } else if (type === "allocations") {
            // General query logic manually replicated here to handle the export variant explicitly
            let q = {};
            if (clusterId) q.cluster = clusterId;
            if (period) q.period = period;
            
            const rawAllocData = await Allocation.find(q).populate('cluster').populate('msme');
            dataPack = rawAllocData.map(a => ({
                 MSME_Name: a.msme ? a.msme.msmeName : "Unknown",
                 Cluster: a.cluster ? a.cluster.clusterName : "Unknown",
                 Period: a.period,
                 Initial_Credits: a.initialCreditsIssued,
                 Risk_Factor: parseFloat(a.riskFactor.toFixed(3)),
                 Effective_Credits: Math.floor(a.effectiveCreditsAllocated),
                 Status: a.status
            }));
            filenameSuffix = "raw_allocations";
        } else {
            return res.status(400).json({ success: false, error: "Invalid exporter arguments" });
        }

        const csvContent = generateCSVReport(dataPack);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filenameSuffix}_${Date.now()}.csv"`);
        return res.status(200).send(csvContent);

    } catch (error) {
         return res.status(500).json({ success: false, error: "Internal error parsing CSV dataset format.", message: error.message });
    }
});

// @route   GET /api/dashboard/export/pdf
// @desc    Download generated visual PDF template stream
router.get('/export/pdf', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const { type, clusterId, msmeId } = req.query;
        let titleBlock = "System Metrics";
        let layoutData = [];

        if (type === "cluster" && clusterId) {
            const r = await getClusterReport(clusterId);
            titleBlock = `Cluster Overview: ${r.clusterName}`;
            layoutData = [
                 { sectionTitle: "Information", data: { Sector: r.sector, State: r.state, MemberCount: r.memberCount } },
                 { sectionTitle: "Credit Profile", data: r.credits },
                 { sectionTitle: "Risk Analysis", data: r.riskAnalysis },
                 // Truncate members so massive clusters don't wreck memory inside standard express pdf layouts
                 { sectionTitle: "Members Snapshot", data: r.members.slice(0, 10) }
            ];
        } else if (type === "msme" && msmeId) {
            const m = await getMSMEReport(msmeId);
            titleBlock = `MSME Profile: ${m?.msmeName || "Unknown"}`;
            layoutData = [
                { sectionTitle: "Progress Metrics", data: m?.allocations || {} },
                { sectionTitle: "Risk Metrics", data: m?.trends || {} },
                { sectionTitle: "Latest Emissions", data: m?.emissions?.slice(0, 5) || [] }
            ];
        } else {
            // Revert back to System
            const sys = await getSystemDashboard();
            layoutData = [
                { sectionTitle: "Global Rollup", data: { 
                     TotalCredits: sys.totalCreditsIssued, 
                     Clusters: sys.activeClusterCount, 
                     MSMEs: sys.activeMSMECount, 
                     AvgRisk: sys.averageRiskFactor 
                }},
                { sectionTitle: "Status Breakdown", data: sys.creditsStatus }
            ];
        }

        const bufferStream = await generatePDFReport(titleBlock, layoutData);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="report_${Date.now()}.pdf"`);
        return res.status(200).send(bufferStream);

    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error configuring PDF content blocks.", message: error.message });
    }
});

// @route   GET /api/dashboard/summary
// @desc    Quick summary for dashboard landing landing pages
router.get('/summary', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        const metrics = await getSystemDashboard();

        let pending = 0;
        try {
            pending = await Allocation.countDocuments({ status: "Allocated" });
        } catch(e) {}

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthAllocations = await Allocation.find({
             createdAt: { $gte: startOfMonth }
        });

        let issuedMo = 0, verifiedMo = 0, claimedMo = 0;
        currentMonthAllocations.forEach(a => {
            issuedMo += a.initialCreditsIssued;
            if (a.status === "Verified") verifiedMo += a.effectiveCreditsAllocated;
            if (a.status === "Claimed") claimedMo += a.effectiveCreditsAllocated;
        });

        return res.status(200).json({
            success: true,
            data: {
                systemHealth: {
                    status: "Healthy",
                    uptime: "99.9%", // Dummy system value for representation per spec
                    lastCheck: new Date()
                },
                keyMetrics: {
                    totalCredits: metrics.totalCreditsIssued,
                    totalMSMEs: metrics.activeMSMECount,
                    totalClusters: metrics.activeClusterCount,
                    avgRiskFactor: metrics.averageRiskFactor
                },
                creditFlow: {
                    issuedThisMonth: Math.floor(issuedMo),
                    verifiedThisMonth: Math.floor(verifiedMo),
                    claimedThisMonth: Math.floor(claimedMo)
                },
                alerts: [
                    {
                        severity: "warning",
                        message: `${pending} allocations mapped to queue and pending formal strict verification processes.`,
                        actionUrl: "/dashboard/verification-queue"
                    }
                ],
                recentActivity: [
                    {
                        type: "system_ping",
                        msme: "System Generated",
                        credits: 0,
                        timestamp: new Date()
                    }
                ]
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: "Failing executing root summary controller code." });
    }
});

// @route   GET /api/dashboard/data-quality
// @desc    Show overall data reliability indicators across metrics subsets
router.get('/data-quality', authMiddleware, requireRole("Admin", "Aggregator"), async (req, res) => {
    try {
        // High level logic based on RiskScore averages globally
        const riskScores = await RiskScore.find().populate('msme');

        let sumCompl = 0, sumConsi = 0, sumHisto = 0;
        const highestRisks = [];

        riskScores.forEach(r => {
             sumCompl += r.dataCompletenessScore;
             sumConsi += r.dataConsistencyScore;
             sumHisto += r.historicalAccuracyScore;

             if (r.riskFactor < 0.6) {
                  highestRisks.push({
                      msmeName: r.msme ? r.msme.msmeName : "Unknown",
                      riskFactor: parseFloat(r.riskFactor.toFixed(3)),
                      riskCategory: r.riskCategory,
                      issues: [
                          r.dataCompletenessScore < 0.8 ? "Low data completeness missing readings" : null,
                          r.dataConsistencyScore < 0.8 ? "Multiple metric spikes detected" : null,
                          r.historicalAccuracyScore < 0.5 ? "Poor historical claim tracking" : null
                      ].filter(Boolean)
                  });
             }
        });

        const numDocs = riskScores.length > 0 ? riskScores.length : 1;
        const oCompl = (sumCompl / numDocs) * 100;
        const oConsi = (sumConsi / numDocs) * 100;
        const oHisto = (sumHisto / numDocs) * 100;
        const overarching = (oCompl + oConsi + oHisto) / 3;

        return res.status(200).json({
            success: true,
            data: {
                overallDataQualityScore: Math.floor(overarching),
                byMetric: {
                    completeness: {
                        score: Math.floor(oCompl),
                        description: `${Math.floor(oCompl)}% score on average metric scheduling adherence.`
                    },
                    consistency: {
                        score: Math.floor(oConsi),
                        description: `${Math.floor(oConsi)}% standard lack-of-anomaly data flow adherence.`
                    },
                    accuracy: {
                        score: Math.floor(oHisto),
                        description: `${Math.floor(oHisto)}% historical system claim reliability confidence.`
                    }
                },
                atRisk: {
                    msmeCount: highestRisks.length,
                    details: highestRisks.slice(0, 5) // Send top 5 bad ones
                },
                recommendations: [
                    highestRisks.length > 0 ? `Contact ${highestRisks.length} at-risk profiled MSMEs to debug missing baselines.` : "All MSMEs feature adequate metrics structures.",
                    "Process trailing Verify allocations to increase Historic Accuracy ratings globally."
                ]
            }
        });
    } catch (error) {
         return res.status(500).json({ success: false, error: "Server logic fault mapping data quality metrics globally." });
    }
});

module.exports = router;
