const DashboardMetrics = require('../models/DashboardMetrics');
const Allocation = require('../models/Allocation');
const EmissionSummary = require('../models/EmissionSummary');
const Cluster = require('../models/Cluster');
const MSME = require('../models/MSME');
const RiskScore = require('../models/RiskScore');
const BaselineReading = require('../models/BaselineReading');
const MonitoringReading = require('../models/MonitoringReading');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * Get global system metrics and utilize caching to prevent excessive DB queries.
 */
const getSystemDashboard = async () => {
    try {
        let metrics = await DashboardMetrics.findOne({
            metricsType: "system",
            expiresAt: { $gt: new Date() }
        });

        if (metrics) return metrics; // Use Cached value

        // 1. Total Credits Issued globally
        const totalCreditsStr = await Allocation.aggregate([
            { $group: { _id: null, total: { $sum: "$initialCreditsIssued" } } }
        ]);
        const totalCreditsIssued = totalCreditsStr.length > 0 ? totalCreditsStr[0].total : 0;

        // 2. Credits Grouped By Workflow Status
        const creditsStatus = await Allocation.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    credits: { $sum: "$effectiveCreditsAllocated" }, // Counting effective based on prompt
                    initialCredits: { $sum: "$initialCreditsIssued" }
                }
            }
        ]);

        // 3. Total Real Emission Reduction
        const totalReductionAgg = await EmissionSummary.aggregate([
            { $group: { _id: null, total: { $sum: "$emissionReduction" } } }
        ]);
        const totalEmissionReduction = totalReductionAgg.length > 0 ? totalReductionAgg[0].total : 0;

        // 4. Entity Counts
        const clusterCount = await Cluster.countDocuments(); // Active assumption if not schema defined
        const msmeCount = await MSME.countDocuments();

        // 5. Global Math Average of All Risks
        const avgRiskFactorAgg = await RiskScore.aggregate([
            { $group: { _id: null, avg: { $avg: "$riskFactor" } } }
        ]);
        const avgRiskFactor = avgRiskFactorAgg.length > 0 ? avgRiskFactorAgg[0].avg : 0;

        // 6. Data Quality Score
        const baselineCount = await BaselineReading.countDocuments();
        let dataQuality = 0;
        if (msmeCount > 0) {
            // Rough estimation of how many expected baselines actually happened globally
            dataQuality = (baselineCount / (msmeCount * 12)) * 100;
        }

        // Generate final structure
        const allocatedStats = creditsStatus.find(s => s._id === "Allocated") || { count: 0, credits: 0, initialCredits: 0 };
        const verifiedStats = creditsStatus.find(s => s._id === "Verified") || { count: 0, credits: 0, initialCredits: 0 };
        const claimedStats = creditsStatus.find(s => s._id === "Claimed") || { count: 0, credits: 0, initialCredits: 0 };
        const pendingStats = creditsStatus.find(s => s._id === "Pending Verification") || { count: 0, credits: 0, initialCredits: 0 };
        
        // Sum total *effectively* distributed credits into the pipeline 
        const totalEffectiveDistributed = allocatedStats.credits + verifiedStats.credits + claimedStats.credits + pendingStats.credits;

        const creditStatusMap = {
            Allocated: { ...allocatedStats, percentage: totalCreditsIssued > 0 ? ((allocatedStats.initialCredits / totalCreditsIssued)*100).toFixed(2) : 0 },
            Verified: { ...verifiedStats, percentage: totalCreditsIssued > 0 ? ((verifiedStats.initialCredits / totalCreditsIssued)*100).toFixed(2) : 0 },
            Claimed: { ...claimedStats, percentage: totalCreditsIssued > 0 ? ((claimedStats.initialCredits / totalCreditsIssued)*100).toFixed(2) : 0 },
            Pending: { ...pendingStats, percentage: totalCreditsIssued > 0 ? ((pendingStats.initialCredits / totalCreditsIssued)*100).toFixed(2) : 0 }
        };

        const topClustersRaw = await Allocation.aggregate([
            { 
                $group: { 
                    _id: "$cluster", 
                    creditsIssued: { $sum: "$initialCreditsIssued" },
                    effectiveCredits: { $sum: "$effectiveCreditsAllocated" },
                    msmes: { $addToSet: "$msme" } 
                } 
            },
            { $sort: { creditsIssued: -1 } },
            { $limit: 5 }
        ]);

        const topClusters = [];
        for (const tc of topClustersRaw) {
            const clusterModel = await Cluster.findById(tc._id);
            if (clusterModel) {
                topClusters.push({
                    clusterName: clusterModel.clusterName,
                    creditsIssued: tc.creditsIssued,
                    effectiveCredits: tc.effectiveCredits,
                    msmeCount: tc.msmes.length
                });
            }
        }

        // Save raw metrics string cache to model tracking
        metrics = await DashboardMetrics.create({
            metricsType: "system",
            totalCreditsIssued: totalCreditsIssued,
            totalCreditsVerified: verifiedStats.credits,
            totalCreditsClaimed: claimedStats.credits,
            totalEmissionReduction: totalEmissionReduction,
            activeClusterCount: clusterCount,
            activeMSMECount: msmeCount,
            averageRiskFactor: avgRiskFactor,
            dataQualityScore: Math.round(dataQuality),
            calculatedAt: new Date(),
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 Hour Cache Configure
        });

        // We return the robust combined object which also contains our computed breakdown structures
        return {
            totalCreditsIssued: Math.floor(totalCreditsIssued),
            totalEmissionReductionTCO2e: Math.floor(totalEmissionReduction),
            activeClusterCount: clusterCount,
            activeMSMECount: msmeCount,
            averageRiskFactor: parseFloat(avgRiskFactor.toFixed(3)),
            dataQualityScore: Math.round(dataQuality),
            creditsStatus: creditStatusMap,
            topClusters,
            lastUpdated: metrics.calculatedAt
        };

    } catch (error) {
        throw new Error("Failed to calculate global system dashboard metrics: " + error.message);
    }
};

/**
 * Generate detailed report for a single cluster's entire architecture history.
 */
const getClusterReport = async (clusterId, periodParam) => {
    try {
        const cluster = await Cluster.findById(clusterId).populate("members");
        if (!cluster) return null;

        let matchQuery = { cluster: cluster._id };
        if (periodParam) matchQuery.period = periodParam;

        const emissions = await EmissionSummary.find(matchQuery).populate("msme", "msmeName address state industrySector");
        const risks = await RiskScore.find(matchQuery);
        const allocations = await Allocation.find(matchQuery).populate("msme", "msmeName address state industrySector");

        let totalBaseline = 0, totalMonitoring = 0, totalReduction = 0;
        emissions.forEach(e => {
             totalBaseline += (e.baselineConsumption || 0);
             totalMonitoring += (e.monitoringConsumption || 0);
             totalReduction += (e.emissionReduction || 0);
        });
        
        let avgRedPct = emissions.length > 0 ? (totalReduction / totalBaseline) * 100 : 0;

        let totalInitialIssued = 0, totalEffectiveAllocated = 0;
        const byStatus = { "Allocated": 0, "Pending Verification": 0, "Verified": 0, "Claimed": 0 };
        
        allocations.forEach(a => {
            totalInitialIssued += a.initialCreditsIssued;
            totalEffectiveAllocated += a.effectiveCreditsAllocated;
            if (byStatus[a.status] !== undefined) byStatus[a.status] += a.effectiveCreditsAllocated;
        });

        const creditsHeld = totalInitialIssued - totalEffectiveAllocated;

        let totalRiskScore = 0;
        const dist = { "Very Low": 0, "Low": 0, "Medium": 0, "High": 0, "Critical": 0 };
        risks.forEach(r => {
             totalRiskScore += r.riskFactor;
             if (dist[r.riskCategory] !== undefined) dist[r.riskCategory] += 1;
        });
        const averageRiskFactor = risks.length > 0 ? (totalRiskScore / risks.length) : 0;

        return {
            clusterId: cluster._id,
            clusterName: cluster.clusterName,
            sector: cluster.sector,
            state: cluster.state,
            memberCount: cluster.members.length,
            period: periodParam || "All Time",
            emissions: {
                totalBaseline,
                totalMonitoring,
                totalReduction,
                averageReductionPercentage: parseFloat(avgRedPct.toFixed(2))
            },
            credits: {
                totalInitialIssued: Math.floor(totalInitialIssued),
                totalEffectiveAllocated: Math.floor(totalEffectiveAllocated),
                creditsHeld: Math.floor(creditsHeld),
                byStatus
            },
            riskAnalysis: {
                averageRiskFactor: parseFloat(averageRiskFactor.toFixed(3)),
                distribution: dist
            },
            members: allocations.map(a => ({
                msmeId: a.msme ? a.msme._id : null,
                msmeName: a.msme ? a.msme.msmeName : "Unknown",
                baseline: emissions.find(e => e.msme?._id?.toString() === a?.msme?._id?.toString())?.baselineConsumption || 0,
                monitoring: emissions.find(e => e.msme?._id?.toString() === a?.msme?._id?.toString())?.monitoringConsumption || 0,
                reduction: emissions.find(e => e.msme?._id?.toString() === a?.msme?._id?.toString())?.emissionReduction || 0,
                riskFactor: parseFloat((a?.riskFactor || 0).toFixed(3)),
                creditsAllocated: Math.floor(a?.effectiveCreditsAllocated || 0),
                status: a?.status || "Unknown"
            })),
            generatedAt: new Date()
        };
    } catch (error) {
        throw new Error("Failed generating cluster report: " + error.message);
    }
};

/**
 * Generate progress report bridging multiple data schemas for an isolated MSME.
 */
const getMSMEReport = async (msmeId) => {
    try {
        const msme = await MSME.findById(msmeId);
        if (!msme) return { notFound: true, message: "MSME not found" };

        console.log("MSME:", msme);

        const baselineCount = await BaselineReading.countDocuments({ msme: msmeId });
        const monitoringCount = await MonitoringReading.countDocuments({ msme: msmeId });
        
        const allocations = await Allocation.find({ msme: msmeId }).populate("msme", "msmeName address state industrySector").sort({ createdAt: -1 });
        const risks = await RiskScore.find({ msme: msmeId }).sort({ createdAt: -1 });
        const emissions = await EmissionSummary.find({ msme: msmeId }).populate("msme", "msmeName address state industrySector").sort({ createdAt: -1 });

        console.log("Emission Data:", emissions);

        if (allocations.length === 0 && emissions.length === 0) {
             return { emptyData: true };
        }

        let totalCreditsEarned = 0, totalCreditsClaimed = 0, totalReduction = 0;
        allocations.forEach(a => {
             totalCreditsEarned += a?.effectiveCreditsAllocated || 0;
             if (a?.status === "Claimed") totalCreditsClaimed += a?.effectiveCreditsAllocated || 0;
        });
        
        emissions.forEach(e => totalReduction += e?.emissionReduction || 0);
        
        const latestRisk = risks.length > 0 ? risks[0] : null;

        const emissionTrend = allocations.map(a => {
             const e = emissions.find(x => x?.period === a?.period);
             return {
                 period: a?.period || "Unknown",
                 baseline: e ? (e?.baselineConsumption || 0) : 0,
                 monitoring: e ? (e?.monitoringConsumption || 0) : 0,
                 reduction: e ? (e?.emissionReduction || 0) : 0,
                 riskFactor: parseFloat((a?.riskFactor || 0).toFixed(3)),
                 creditsIssued: a?.initialCreditsIssued || 0,
                 creditsAllocated: Math.floor(a?.effectiveCreditsAllocated || 0),
                 status: a?.status || "Unknown",
                 state: a?.msme?.address?.state || a?.msme?.state || msme?.address?.state || "Unknown"
             };
        });

        // Get basic cluster info safely
        let clusterInfo = null;
        if (allocations.length > 0 && allocations[0].cluster) {
              const cluster = await Cluster.findById(allocations[0].cluster);
              if (cluster) {
                  clusterInfo = {
                      clusterId: cluster._id,
                      clusterName: cluster?.clusterName || "Unknown",
                      clusterMembers: cluster?.members?.length || 0,
                      state: cluster?.state || "Unknown"
                  };
              }
        }

        return {
            msmeName: msme?.msmeName || "Unknown",
            state: msme?.address?.state || msme?.state || "Unknown",
            sector: msme?.industrySector || "Unknown",
            emissions: emissionTrend,
            allocations: {
                totalBaselineReadings: baselineCount || 0,
                totalMonitoringReadings: monitoringCount || 0,
                totalEmissionReduction: totalReduction || 0,
                totalCreditsEarned: Math.floor(totalCreditsEarned),
                totalCreditsClaimed: Math.floor(totalCreditsClaimed),
                creditsRemaining: Math.floor(totalCreditsEarned - totalCreditsClaimed),
                clusterAssignment: clusterInfo
            },
            trends: latestRisk ? {
                latestRiskFactor: parseFloat((latestRisk?.riskFactor || 0).toFixed(3)),
                riskCategory: latestRisk?.riskCategory || "Unknown",
                dataCompletenessScore: latestRisk?.dataCompletenessScore || 0,
                dataConsistencyScore: latestRisk?.dataConsistencyScore || 0,
                historicalAccuracyScore: latestRisk?.historicalAccuracyScore || 0
            } : null,
            generatedAt: new Date()
        };
    } catch (error) {
        throw error;
    }
};

/**
 * List all pending, allocated items targeting Verifier approvals.
 */
const getVerificationQueue = async (limit = 50, statusFilter, sortBy) => {
    try {
        let query = { status: { $in: ["Allocated", "Pending Verification"] } };
        if (statusFilter) query.status = statusFilter;

        let sortCmd = { createdAt: 1 }; // Oldest first default
        if (sortBy === "byCredits") sortCmd = { effectiveCreditsAllocated: -1 };

        const pending = await Allocation.find(query)
            .sort(sortCmd)
            .limit(parseInt(limit))
            .populate('msme', 'msmeName address state industrySector')
            .populate('cluster')
            .populate('riskScore');

        return pending.map(a => {
            const ageMs = Date.now() - new Date(a.createdAt).getTime();
            return {
                allocationId: a._id,
                msmeId: a.msme ? a.msme._id : null,
                msmeName: a.msme ? a.msme.msmeName : "Unknown",
                clusterId: a.cluster ? a.cluster._id : null,
                clusterName: a.cluster ? a.cluster.clusterName : "Unknown",
                period: a.period,
                creditsAwaitingVerification: Math.floor(a.effectiveCreditsAllocated),
                riskFactor: parseFloat(a.riskFactor.toFixed(3)),
                riskCategory: a.riskScore ? a.riskScore.riskCategory : undefined,
                dataQualityNotes: a.riskScore ? a.riskScore.riskNotes : "Awaiting detailed evaluation",
                createdAt: a.createdAt,
                daysWaiting: Math.floor(ageMs / (1000 * 60 * 60 * 24))
            };
        });
    } catch (error) {
         throw new Error("Failed Verification Queue output: " + error.message);
    }
};

/**
 * Convert tabular DB data inputs recursively into CSV download format.
 */
const generateCSVReport = (data) => {
    if (!data || data.length === 0) return "";
    try {
        const json2csvParser = new Parser();
        return json2csvParser.parse(data);
    } catch (err) {
        throw new Error("Error generating CSV layout: " + err.message);
    }
};

/**
 * Execute robust structural formatting to export PDF metrics documents using stream buffers.
 */
const generatePDFReport = async (title, metricsArr) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header Layout ---
            doc.fontSize(20).text(`ClusterCarbon Generated PDF Data Report: ${title}`, { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(`Timestamp Logged: ${new Date().toUTCString()}`, { align: "center" });
            doc.moveDown(2);

            // Print arbitrary tabular key/value metrics cleanly
            // Very simplified PDF generation mapping structure to prevent overly complex UI libraries
            metricsArr.forEach((block) => {
                doc.fontSize(14).text(block.sectionTitle, { underline: true });
                doc.moveDown(0.5);
                
                doc.fontSize(11);
                if (Array.isArray(block.data)) {
                    block.data.forEach(item => {
                         doc.text(JSON.stringify(item));
                    });
                } else if (typeof block.data === "object") {
                     Object.keys(block.data).forEach(k => {
                          doc.text(`${k}: ${JSON.stringify(block.data[k])}`);
                     });
                } else {
                     doc.text(block.data);
                }
                doc.moveDown(1.5);
            });

            doc.end();
            
        } catch (error) {
            reject(new Error("Unable to build PDF context buffers: " + error.message));
        }
    });
};

module.exports = {
    getSystemDashboard,
    getClusterReport,
    getMSMEReport,
    getVerificationQueue,
    generateCSVReport,
    generatePDFReport
};
