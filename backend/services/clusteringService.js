const Cluster = require('../models/Cluster');
const MSME = require('../models/MSME');
const MonitoringReading = require('../models/MonitoringReading');
const calculationService = require('./calculationService');

const recomputeClusters = async () => {
    try {
        const allMSMEs = await MSME.find({});
        
        const groupedByCluster = {};
        allMSMEs.forEach(msme => {
            // Note: MSME model uses industrySector, fallback to sector if any structure uses it
            const sector = msme.industrySector || msme.sector; 
            const state = msme.state;
            
            if (!sector || !state) return;
            
            const key = `${sector}|${state}`;
            if (!groupedByCluster[key]) {
                groupedByCluster[key] = {
                    sector: sector,
                    state: state,
                    members: []
                };
            }
            groupedByCluster[key].members.push(msme._id);
        });

        const updatedClusters = [];

        for (const key in groupedByCluster) {
            const group = groupedByCluster[key];
            const cluster = await Cluster.findOneAndUpdate(
                { sector: group.sector, state: group.state },
                {
                    clusterName: `${group.sector} - ${group.state}`,
                    sector: group.sector,
                    state: group.state,
                    members: group.members,
                    memberCount: group.members.length,
                    lastRecomputedAt: new Date()
                },
                { upsert: true, new: true }
            );
            updatedClusters.push({
                sector: cluster.sector,
                state: cluster.state,
                memberCount: cluster.memberCount
            });
        }

        return {
            success: true,
            message: "Clustering recomputed successfully",
            clusterCount: Object.keys(groupedByCluster).length,
            totalMSMEs: allMSMEs.length,
            clusters: updatedClusters
        };
    } catch (error) {
        console.error("Error recomputing clusters:", error);
        return { success: false, message: "Error recomputing clusters", error: error.message };
    }
};

const getClusterMetrics = async (clusterId) => {
    try {
        const cluster = await Cluster.findById(clusterId).populate("members");
        if (!cluster) {
            return { success: false, message: "Cluster not found" };
        }

        let totalBaselineAverage = 0;
        let totalMonitoringAverage = 0;
        let totalEmissionReduction = 0;
        const membersMetrics = [];

        for (const msme of cluster.members) {
            // Get baseline
            const baselineData = await calculationService.calculateBaselineAverage(msme._id);
            const baseline = (baselineData.success && baselineData.averageConsumption) ? baselineData.averageConsumption : 0;
            
            // Get latest monitoring
            const latestReading = await MonitoringReading.findOne({ msme: msme._id }).sort({ readingDate: -1 });
            const monitoring = latestReading ? latestReading.energyConsumption : 0;
            
            // Calculate reduction
            const reductionData = calculationService.calculateEmissionReduction(baseline, monitoring);
            const reduction = reductionData.emissionReduction || 0;

            totalBaselineAverage += baseline;
            totalMonitoringAverage += monitoring;
            totalEmissionReduction += reduction;

            membersMetrics.push({
                msmeId: msme._id,
                msmeName: msme.msmeName,
                baseline: baseline,
                monitoring: monitoring,
                reduction: reduction,
                reductionPercentage: reductionData.reductionPercentage || 0
            });
        }

        let averageReductionPercentage = 0;
        if (totalBaselineAverage > 0) {
            averageReductionPercentage = parseFloat(((totalEmissionReduction / totalBaselineAverage) * 100).toFixed(2));
        }

        // Update cluster metadata with latest calculations
        cluster.totalBaselineAverage = totalBaselineAverage;
        cluster.totalEmissionReduction = totalEmissionReduction;
        await cluster.save();

        return {
            success: true,
            data: {
                clusterId: cluster._id,
                clusterName: cluster.clusterName,
                sector: cluster.sector,
                state: cluster.state,
                memberCount: cluster.memberCount,
                totalBaselineAverage,
                totalMonitoringAverage,
                totalEmissionReduction,
                averageReductionPercentage,
                clusterStatus: cluster.clusterStatus,
                members: membersMetrics
            }
        };
    } catch (error) {
        console.error("Error calculating cluster metrics:", error);
        return { success: false, message: "Error calculating cluster metrics", error: error.message };
    }
};

const addMSMEToCluster = async (msmeId, clusterId) => {
    try {
        const cluster = await Cluster.findById(clusterId);
        if (!cluster) return { success: false, message: "Cluster not found" };

        if (cluster.members.includes(msmeId)) {
            return { success: false, message: "MSME already in cluster" };
        }

        cluster.members.push(msmeId);
        cluster.memberCount = cluster.members.length;
        await cluster.save();

        return { success: true, message: "MSME added to cluster", cluster };
    } catch (error) {
        return { success: false, message: "Error adding MSME to cluster", error: error.message };
    }
};

const removeMSMEFromCluster = async (msmeId, clusterId) => {
    try {
        const cluster = await Cluster.findById(clusterId);
        if (!cluster) return { success: false, message: "Cluster not found" };

        cluster.members = cluster.members.filter(id => id.toString() !== msmeId.toString());
        cluster.memberCount = cluster.members.length;
        await cluster.save();

        return { success: true, message: "MSME removed from cluster", cluster };
    } catch (error) {
        return { success: false, message: "Error removing MSME from cluster", error: error.message };
    }
};

module.exports = {
    recomputeClusters,
    getClusterMetrics,
    addMSMEToCluster,
    removeMSMEFromCluster
};
