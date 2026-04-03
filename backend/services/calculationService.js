const BaselineReading = require('../models/BaselineReading');

/**
 * Calculate the overall average consumption across all historical baseline data.
 */
const calculateBaselineAverage = async (msmeId) => {
    try {
        const readings = await BaselineReading.find({ msme: msmeId });

        if (!readings || readings.length === 0) {
            return { error: "No baseline readings found", averageConsumption: null, totalReadings: 0 };
        }

        let sum = 0;
        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        // Iterate mathematically across raw data
        readings.forEach((record) => {
            sum += record.energyConsumption;
            if (record.energyConsumption < minValue) minValue = record.energyConsumption;
            if (record.energyConsumption > maxValue) maxValue = record.energyConsumption;
        });

        // Resolve math formulas
        const count = readings.length;
        const average = sum / count;

        return {
            success: true,
            averageConsumption: average,
            totalReadings: count,
            minValue: minValue,
            maxValue: maxValue,
            // Assuming continuity, grab the first defined unit found
            unit: readings[0].unit 
        };

    } catch (error) {
        console.error("Error calculating average baseline:", error);
        return { error: "Failed calculating baseline average." };
    }
};

/**
 * Determine CO2 reduction percentages between the original baseline and tracking period value
 */
const calculateEmissionReduction = (baselineAverage, monitoringValue) => {
    const reduction = baselineAverage - monitoringValue;
    
    // Convert to direct math percentage out of 100, checking zero-div defaults
    let reductionPercentage = 0;
    if (baselineAverage > 0) {
        reductionPercentage = (reduction / baselineAverage) * 100;
    }

    return {
        baselineAverage: baselineAverage,
        monitoringConsumption: monitoringValue,
        emissionReduction: reduction,
        reductionPercentage: parseFloat(reductionPercentage.toFixed(2)),
        status: reduction > 0 ? "Positive (improvement)" : "Negative (increase)"
    };
};

/**
 * Fetches the very latest available Baseline chronological entity record.
 */
const getLatestBaselineReading = async (msmeId) => {
    try {
        const latestReading = await BaselineReading.findOne({ msme: msmeId }).sort({ readingDate: -1 });
        return latestReading;
    } catch (error) {
        console.error("Error fetching latest baseline:", error);
        return null;
    }
};

module.exports = {
    calculateBaselineAverage,
    calculateEmissionReduction,
    getLatestBaselineReading
};
