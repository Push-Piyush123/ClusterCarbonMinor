const BaselineReading = require('../models/BaselineReading');
const MonitoringReading = require('../models/MonitoringReading');

/**
 * Ensure energy consumption is realistic based on typical limits.
 */
const validateEnergyConsumption = (value, unit) => {
    if (typeof value !== "number" || isNaN(value)) {
        return { valid: false, error: "Energy consumption must be a number" };
    }

    if (value <= 0) {
        return { valid: false, error: "Energy consumption must be greater than 0" };
    }

    // Checking realistic maximums based on unit types
    let max = 0;
    switch (unit) {
        case "kWh":
            max = 10000000; // 10M kWh/year for large industry
            break;
        case "Litres":
            max = 500000; // 500k litres/year
            break;
        case "Tonnes":
            max = 100000; // 100k tonnes/year
            break;
        case "MWh":
            max = 100000; // 100k MWh/year
            break;
        default:
            return { valid: false, error: "Invalid energy unit provided" };
    }

    if (value > max) {
        return { valid: false, error: "Energy consumption value unrealistically high for unit " + unit };
    }

    return { valid: true };
};

/**
 * Ensure reading dates are not chronologically impossible.
 */
const validateReadingDate = (date) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return { valid: false, error: "Invalid date format" };
    }

    const today = new Date();
    
    // Future Date logic
    if (dateObj > today) {
        return { valid: false, error: "Reading date cannot be in the future" };
    }

    // Historical Limit check (must not be older than ten years)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(today.getFullYear() - 10);
    
    if (dateObj < tenYearsAgo) {
        // We log it as a console warning, but let it proceed as potentially valid backlog data
        console.warn(`[WARNING] Logged reading date is over 10 years old: ${dateObj.toISOString()}`);
    }

    return { valid: true };
};

/**
 * Prevent duplicate readings for the same MSME on exactly the same day.
 */
const validateDuplicateReading = async (msmeId, readingDate, readingType) => {
    try {
        const Model = readingType === "baseline" ? BaselineReading : MonitoringReading;

        // Bounding the start and end periods for exactly that target 24-hr envelope
        const startOfDay = new Date(readingDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(readingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingReading = await Model.findOne({
            msme: msmeId,
            readingDate: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingReading) {
            return { valid: false, error: "A " + readingType + " reading for this date already exists" };
        }

        return { valid: true };
    } catch (error) {
        console.error("Error validating duplicates:", error);
        return { valid: false, error: "Internal error checking duplicate constraints" };
    }
};

/**
 * Check for extreme edge cases causing anomalies between reading cycles.
 */
const validateDataConsistency = (previousValue, currentValue) => {
    // Allows skipping check if this is their first initial reading baseline.
    if (previousValue === null || previousValue === undefined) {
        return { valid: true };
    }

    // Determine raw change percentage boundaries compared to last reporting period
    const change = Math.abs((currentValue - previousValue) / previousValue * 100);

    // Provide warning wrapper if change spikes dramatically in one cycle (e.g > 200%)
    if (change > 200) {
        return { valid: true, warning: "Unusual spike detected: " + change.toFixed(2) + "% change" };
    }

    return { valid: true };
};

module.exports = {
    validateEnergyConsumption,
    validateReadingDate,
    validateDuplicateReading,
    validateDataConsistency
};
