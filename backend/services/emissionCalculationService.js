const Cluster = require('../models/Cluster');
const MSME = require('../models/MSME');
const MonitoringReading = require('../models/MonitoringReading');
const EmissionSummary = require('../models/EmissionSummary');
const { calculateBaselineAverage } = require('./calculationService');

const calculateClusterEmissions = async (clusterId, periodStart, periodEnd, periodLabel) => {
    try {
        const cluster = await Cluster.findById(clusterId).populate("members");
        if (!cluster) return { error: "Cluster not found" };

        const msmeReductions = [];

        for (const msmeId of cluster.members) {
            // Get baseline average
            const baselineData = await calculateBaselineAverage(msmeId);
            
            // Get monitoring reading in period (assuming date constraints inclusive)
            const monitoring = await MonitoringReading.findOne({
                msme: msmeId,
                readingDate: { $gte: new Date(periodStart), $lte: new Date(periodEnd) }
            }).sort({ readingDate: -1 });

            if (!monitoring) {
                // Skip MSME if no monitoring data in period
                continue;
            }

            // Calculate reduction
            const bConsumption = baselineData.averageConsumption || 0;
            const mConsumption = monitoring.energyConsumption || 0;
            let reduction = bConsumption - mConsumption;
            
            // Negative reduction means consumption increased. 
            // The prompt says "Reduction: 0 (increased, not decreased)"
            const positiveReduction = reduction > 0 ? reduction : 0;
            
            let reductionPct = 0;
            if (bConsumption > 0) {
                reductionPct = parseFloat(((reduction / bConsumption) * 100).toFixed(2));
            }

            msmeReductions.push({
                msmeId: msmeId._id || msmeId, // populated or direct ObjectId
                baseline: bConsumption,
                monitoring: mConsumption,
                reduction: positiveReduction,
                reductionPct,
                unit: baselineData.unit || monitoring.unit
            });
        }

        if (msmeReductions.length === 0) {
            return { error: "Cluster has no monitoring data for this period" };
        }

        // Calculate cluster totals
        const clusterTotalReduction = msmeReductions.reduce((sum, r) => sum + r.reduction, 0);

        // Calculate each MSME's contribution percentage
        const reductionsWithShare = msmeReductions.map(r => {
            let contributionPct = 0;
            if (clusterTotalReduction > 0) {
                contributionPct = parseFloat(((r.reduction / clusterTotalReduction) * 100).toFixed(2));
            }
            return {
                ...r,
                contributionPct
            };
        });

        // Create/update EmissionSummary documents
        const summaries = [];
        for (const reduction of reductionsWithShare) {
            const summary = await EmissionSummary.findOneAndUpdate(
                {
                    cluster: clusterId,
                    msme: reduction.msmeId,
                    period: periodLabel
                },
                {
                    cluster: clusterId,
                    msme: reduction.msmeId,
                    period: periodLabel,
                    periodStart: new Date(periodStart),
                    periodEnd: new Date(periodEnd),
                    baselineConsumption: reduction.baseline,
                    baselineUnit: reduction.unit,
                    monitoringConsumption: reduction.monitoring,
                    monitoringUnit: reduction.unit,
                    emissionReduction: reduction.reduction,
                    reductionPercentage: reduction.reductionPct,
                    clusterTotalReduction,
                    msmeContributionPercentage: reduction.contributionPct,
                    creditsIssued: reduction.reduction, // 1 credit = 1 tCO2e
                    status: "Calculated"
                },
                { upsert: true, new: true }
            );
            summaries.push(summary);
        }

        return {
            success: true,
            clusterId,
            clusterName: cluster.clusterName,
            period: periodLabel,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            clusterTotalReduction,
            totalCreditsIssued: clusterTotalReduction,
            msmeCount: summaries.length,
            summaries: summaries.map(s => ({
                msmeId: s.msme,
                emissionReduction: s.emissionReduction,
                creditsIssued: s.creditsIssued,
                contributionPercentage: s.msmeContributionPercentage
            }))
        };
    } catch (error) {
        console.error("Error calculating cluster emissions:", error);
        return { error: error.message };
    }
};

const getEmissionStatus = async (msmeId) => {
    try {
        const summaries = await EmissionSummary.find({ msme: msmeId }).sort({ periodStart: -1 });

        const totalReduction = summaries.reduce((sum, s) => sum + (s.emissionReduction || 0), 0);
        const totalCredits = summaries.reduce((sum, s) => sum + (s.creditsIssued || 0), 0);
        const msme = await MSME.findById(msmeId);

        let latestPeriod = null;
        if (summaries && summaries.length > 0) {
            latestPeriod = {
                period: summaries[0].period,
                emissionReduction: summaries[0].emissionReduction,
                creditsIssued: summaries[0].creditsIssued,
                msmeContributionPercentage: summaries[0].msmeContributionPercentage,
                status: summaries[0].status
            };
        }

        return {
            msmeId,
            msmeName: msme ? msme.msmeName : "Unknown MSME",
            totalEmissionReduction: totalReduction,
            totalCreditsIssued: totalCredits,
            totalPeriods: summaries.length,
            latestPeriod,
            allPeriods: summaries.map(s => ({
                period: s.period,
                periodStart: s.periodStart,
                periodEnd: s.periodEnd,
                baselineConsumption: s.baselineConsumption,
                monitoringConsumption: s.monitoringConsumption,
                emissionReduction: s.emissionReduction,
                creditsIssued: s.creditsIssued,
                contributionPct: s.msmeContributionPercentage,
                status: s.status
            }))
        };
    } catch (error) {
        console.error("Error getting emission status:", error);
        return { error: error.message };
    }
};

const getClusterEmissionSummary = async (clusterId, period) => {
    try {
        const summaries = await EmissionSummary.find({ cluster: clusterId, period: period }).populate('msme');
        return Object.values(summaries).map(s => ({
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
    } catch (error) {
        console.error("Error getting cluster emission summary:", error);
        return { error: error.message };
    }
};

const getDashboardMetrics = async (filters = {}) => {
    try {
        const query = {};
        if (filters.clusterId) query.cluster = filters.clusterId;
        if (filters.status) query.status = filters.status;
        if (filters.startDate || filters.endDate) {
            query.periodStart = {};
            if (filters.startDate) query.periodStart.$gte = new Date(filters.startDate);
            if (filters.endDate) query.periodStart.$lte = new Date(filters.endDate);
        }

        const summaries = await EmissionSummary.find(query).populate('cluster').populate('msme');

        let totalCreditsIssued = 0;
        let totalEmissionReduction = 0;
        let totalReductionPercentageSum = 0;
        const mappedClusters = {};
        const mappedMSMEs = {};
        
        const statusBreakdown = {
            "Calculated": 0,
            "Issued": 0,
            "Verified": 0,
            "Claimed": 0
        };

        summaries.forEach(s => {
            totalCreditsIssued += (s.creditsIssued || 0);
            totalEmissionReduction += (s.emissionReduction || 0);
            totalReductionPercentageSum += (s.reductionPercentage || 0);
            
            if (s.status && statusBreakdown[s.status] !== undefined) {
                statusBreakdown[s.status] += 1;
            }

            if (s.cluster) {
                const cId = s.cluster._id.toString();
                if (!mappedClusters[cId]) {
                    mappedClusters[cId] = {
                        clusterName: s.cluster.clusterName,
                        sector: s.cluster.sector,
                        state: s.cluster.state,
                        creditsIssued: 0,
                        msmeSet: new Set()
                    };
                }
                mappedClusters[cId].creditsIssued += (s.creditsIssued || 0);
                if (s.msme) {
                    mappedClusters[cId].msmeSet.add(s.msme._id.toString());
                }
            }

            if (s.msme) {
                const mId = s.msme._id.toString();
                if (!mappedMSMEs[mId]) {
                    mappedMSMEs[mId] = {
                        msmeName: s.msme.msmeName,
                        creditsIssued: 0
                    };
                }
                mappedMSMEs[mId].creditsIssued += (s.creditsIssued || 0);
            }
        });

        const totalClustersCount = Object.keys(mappedClusters).length;
        const totalMSMEsCount = Object.keys(mappedMSMEs).length;
        const avgReductionPercentage = summaries.length > 0 ? parseFloat((totalReductionPercentageSum / summaries.length).toFixed(2)) : 0;

        const topClusters = Object.values(mappedClusters)
            .map(c => ({
                clusterName: c.clusterName,
                sector: c.sector,
                state: c.state,
                creditsIssued: c.creditsIssued,
                msmeCount: c.msmeSet.size
            }))
            .sort((a, b) => b.creditsIssued - a.creditsIssued)
            .slice(0, 10);

        const topMSMEs = Object.values(mappedMSMEs)
            .sort((a, b) => b.creditsIssued - a.creditsIssued)
            .slice(0, 10);

        return {
            totalCreditsIssued,
            totalEmissionReductionTCO2e: totalEmissionReduction,
            totalClusters: totalClustersCount,
            totalMSMEsParticipating: totalMSMEsCount,
            averageReductionPercentage: avgReductionPercentage,
            statusBreakdown,
            topClusters,
            topMSMEs
        };
    } catch (error) {
        console.error("Error getting dashboard metrics:", error);
        return { error: error.message };
    }
};

module.exports = {
    calculateClusterEmissions,
    getEmissionStatus,
    getClusterEmissionSummary,
    getDashboardMetrics
};
