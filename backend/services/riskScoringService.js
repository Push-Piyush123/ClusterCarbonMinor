const BaselineReading = require('../models/BaselineReading');
const MonitoringReading = require('../models/MonitoringReading');
const EmissionSummary = require('../models/EmissionSummary');
const RiskScore = require('../models/RiskScore');
const Allocation = require('../models/Allocation');

/**
 * Check how consistently MSME submits readings based on an expected cadence.
 */
const calculateDataCompletenessScore = async (msmeId, periodStart, periodEnd) => {
    // For a standard 1-month monitoring period, we expect ~1 baseline and ~1 monitoring = 2 readings
    // Assuming 12 expected baselines in a given full year, we calculate total submissions in timeframe
    const expectedBaselineReadings = 12; // Adjusted depending on time window in production, using user baseline
    const expectedMonitoringReadings = 1;
    
    const baselineReadings = await BaselineReading.countDocuments({
        msme: msmeId,
        readingDate: { $gte: periodStart, $lte: periodEnd }
    });
    
    const monitoringReadings = await MonitoringReading.countDocuments({
        msme: msmeId,
        readingDate: { $gte: periodStart, $lte: periodEnd }
    });
    
    // As per user specification logic
    const totalReadings = baselineReadings + monitoringReadings;
    const expectedReadings = expectedBaselineReadings + expectedMonitoringReadings;
    const completenessScore = Math.min(totalReadings / expectedReadings, 1.0);
    
    return completenessScore; // (0 to 1)
};

/**
 * Detect anomalies or statistical spikes in energy consumption indicative of poor data.
 */
const calculateDataConsistencyScore = async (msmeId) => {
    const readings = await BaselineReading.find({ msme: msmeId });
    if (readings.length < 3) return 1.0; // Not enough statistical data to realistically assess anomalies

    const values = readings.map(r => r.energyConsumption);
    const mean = values.reduce((a, b) => a + b) / values.length;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);

    // Anomalies defined as values > mean + 2*sigma
    const anomalies = values.filter(v => v > mean + 2 * stddev).length;
    const anomalyRatio = anomalies / values.length;

    const consistencyScore = Math.max(1.0 - anomalyRatio, 0.0);
    return consistencyScore;
};

/**
 * Check how many previous periods were successfully audited/verified by a Verifier.
 */
const calculateHistoricalAccuracyScore = async (msmeId) => {
    const previousEmissions = await EmissionSummary.find({
        msme: msmeId,
        status: { $in: ["Verified", "Claimed"] } // Only verified/claimed ones truly count
    });

    const totalPeriods = await EmissionSummary.countDocuments({ msme: msmeId });
    if (totalPeriods === 0) return 0.5; // No history, assume medium risk by default

    const accuracyScore = previousEmissions.length / totalPeriods;
    return Math.min(accuracyScore, 1.0);
};

/**
 * Combine all three sub-scores into a cohesive RiskScore tracking entity.
 */
const calculateRiskScore = async (msmeId, clusterId, period, periodStart, periodEnd, reqUser) => {
    try {
        const completeness = await calculateDataCompletenessScore(msmeId, periodStart, periodEnd);
        const consistency = await calculateDataConsistencyScore(msmeId);
        const accuracy = await calculateHistoricalAccuracyScore(msmeId);

        const riskFactor = (completeness + consistency + accuracy) / 3;

        let riskCategory;
        if (riskFactor >= 0.9) riskCategory = "Very Low";
        else if (riskFactor >= 0.75) riskCategory = "Low";
        else if (riskFactor >= 0.6) riskCategory = "Medium";
        else if (riskFactor >= 0.3) riskCategory = "High";
        else riskCategory = "Critical";

        const riskScore = await RiskScore.findOneAndUpdate(
            { msme: msmeId, period: period },
            {
                msme: msmeId,
                cluster: clusterId,
                period,
                periodStart,
                periodEnd,
                dataCompletenessScore: completeness,
                dataConsistencyScore: consistency,
                historicalAccuracyScore: accuracy,
                riskFactor,
                riskCategory,
                calculatedAt: new Date(),
                calculatedBy: reqUser ? reqUser.id : null 
            },
            { upsert: true, new: true }
        );

        return {
            success: true,
            riskScore: {
                riskFactor,
                riskCategory,
                completeness,
                consistency,
                accuracy
            }
        };

    } catch (error) {
        console.error("Error creating mathematical RiskScore calculation: ", error);
        return { success: false, error: error.message };
    }
};

/**
 * Apply generated risk factors to raw initial credits and build official Allocation documents.
 */
const allocateCredits = async (clusterId, period) => {
    try {
        const emissions = await EmissionSummary.find({
            cluster: clusterId,
            period: period
        });

        const clusterTotalInitialCredits = emissions.reduce((sum, e) => sum + e.creditsIssued, 0);
        const allocations = [];

        for (const emission of emissions) {
            let riskScore = await RiskScore.findOne({
                msme: emission.msme,
                period: period
            });
            
            if (!riskScore) {
                // If it bypassed scoring calculation, apply a heavy penalty risk fallback
                riskScore = { riskFactor: 0.6, _id: null };
            }
            
            const effectiveCredits = emission.creditsIssued * riskScore.riskFactor;
            
            const msmeContributionPct = emission.msmeContributionPercentage;
            const msmeEffectivePct = msmeContributionPct * riskScore.riskFactor;
            
            const allocation = await Allocation.findOneAndUpdate(
                {
                    cluster: clusterId,
                    msme: emission.msme,
                    period: period
                },
                {
                    cluster: clusterId,
                    msme: emission.msme,
                    emissionSummary: emission._id,
                    riskScore: riskScore._id,
                    period,
                    periodStart: emission.periodStart,
                    periodEnd: emission.periodEnd,
                    initialCreditsIssued: emission.creditsIssued,
                    riskFactor: riskScore.riskFactor,
                    effectiveCreditsAllocated: effectiveCredits,
                    clusterTotalInitialCredits,
                    msmeContributionPercentage: msmeContributionPct,
                    msmeEffectivePercentage: msmeEffectivePct,
                    status: "Allocated",
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            
            allocations.push(allocation);
        }

        const totalEffectiveCredits = allocations.reduce((sum, a) => sum + a.effectiveCreditsAllocated, 0);

        return {
            success: true,
            clusterId,
            period,
            totalInitialCredits: clusterTotalInitialCredits,
            totalEffectiveCreditsAllocated: totalEffectiveCredits,
            msmeCount: allocations.length,
            allocations: allocations.map(a => ({
                msmeId: a.msme,
                initialCredits: a.initialCreditsIssued,
                riskFactor: a.riskFactor,
                effectiveCredits: a.effectiveCreditsAllocated
            }))
        };

    } catch (error) {
        console.error("Allocation execution error: ", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    calculateDataCompletenessScore,
    calculateDataConsistencyScore,
    calculateHistoricalAccuracyScore,
    calculateRiskScore,
    allocateCredits
};
