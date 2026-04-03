const express = require('express');
const router = express.Router();
const BaselineReading = require('../models/BaselineReading');
const MonitoringReading = require('../models/MonitoringReading');
const MSME = require('../models/MSME');
const { checkMSMEAccess } = require('../middleware/msmeAccessControl');

// Services
const {
    validateEnergyConsumption,
    validateReadingDate,
    validateDuplicateReading,
    validateDataConsistency
} = require('../services/dataValidationService');
const {
    calculateBaselineAverage,
    calculateEmissionReduction,
    getLatestBaselineReading
} = require('../services/calculationService');

// @route   POST /api/msmes/:id/baseline
// @desc    Submit initial historical baseline
router.post('/:id/baseline', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;
        const { energyConsumption, unit, readingDate, notes } = req.body;

        const msme = await MSME.findById(msmeId);
        if (!msme) return res.status(404).json({ success: false, error: "MSME target could not be verified" });

        // 1. Validate numerical size logic constraints
        const usageCheck = validateEnergyConsumption(energyConsumption, unit);
        if (!usageCheck.valid) return res.status(400).json({ success: false, error: usageCheck.error });

        // 2. Validate historical boundaries 
        const dateCheck = validateReadingDate(readingDate);
        if (!dateCheck.valid) return res.status(400).json({ success: false, error: dateCheck.error });

        // 3. Prevent direct overlapping duplication
        const duplicateCheck = await validateDuplicateReading(msmeId, readingDate, "baseline");
        if (!duplicateCheck.valid) return res.status(400).json({ success: false, error: duplicateCheck.error });

        // Create Mongoose document
        const baseline = new BaselineReading({
            msme: msmeId,
            energyConsumption,
            unit,
            readingDate,
            notes
        });
        await baseline.save();

        res.status(201).json({
            success: true,
            message: "Baseline reading saved successfully",
            data: baseline
        });

    } catch (error) {
        console.error("Baseline posting endpoint err:", error);
        res.status(500).json({ success: false, error: "Internal server error submitting baseline" });
    }
});

// @route   POST /api/msmes/:id/monitoring
// @desc    Submit tracking recurring values
router.post('/:id/monitoring', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;
        const { energyConsumption, unit, readingDate, periodStart, periodEnd, notes } = req.body;

        const msme = await MSME.findById(msmeId);
        if (!msme) return res.status(404).json({ success: false, error: "MSME target could not be verified" });

        // Validate basic rules
        const usageCheck = validateEnergyConsumption(energyConsumption, unit);
        if (!usageCheck.valid) return res.status(400).json({ success: false, error: usageCheck.error });

        const dateCheck = validateReadingDate(readingDate);
        if (!dateCheck.valid) return res.status(400).json({ success: false, error: dateCheck.error });

        // Verify it isn't predating the baseline initiation
        const latestBaseline = await getLatestBaselineReading(msmeId);
        if (latestBaseline && new Date(readingDate) < new Date(latestBaseline.readingDate)) {
            return res.status(400).json({ success: false, error: "Monitoring date cannot be submitted before baseline start date" });
        }

        const duplicateCheck = await validateDuplicateReading(msmeId, readingDate, "monitoring");
        if (!duplicateCheck.valid) return res.status(400).json({ success: false, error: duplicateCheck.error });

        const monitoringEntry = new MonitoringReading({
            msme: msmeId,
            energyConsumption,
            unit,
            readingDate,
            periodStart,
            periodEnd,
            notes
        });
        await monitoringEntry.save();

        res.status(201).json({
            success: true,
            message: "Monitoring reading saved successfully",
            data: monitoringEntry
        });

    } catch (error) {
        console.error("Monitoring posting endpoint err:", error);
        res.status(500).json({ success: false, error: "Internal server error submitting monitoring block" });
    }
});

// @route   GET /api/msmes/:id/baseline-history
// @desc    Pull paginated list of all baselines
router.get('/:id/baseline-history', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;
        const limitParam = parseInt(req.query.limit) || 50;
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;

        const histories = await BaselineReading.find({ msme: msmeId })
                                               .sort({ readingDate: sortOrder })
                                               .limit(limitParam);

        res.status(200).json({
            success: true,
            totalCount: histories.length,
            data: histories
        });
    } catch (error) {
        console.error("Baseline historical pull err:", error);
        res.status(500).json({ success: false, error: "Server error querying baseline histories" });
    }
});

// @route   GET /api/msmes/:id/monitoring-history
// @desc    Pull paginated list of tracking records
router.get('/:id/monitoring-history', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;
        const limitParam = parseInt(req.query.limit) || 50;
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;

        const histories = await MonitoringReading.find({ msme: msmeId })
                                                 .sort({ readingDate: sortOrder })
                                                 .limit(limitParam);

        res.status(200).json({
            success: true,
            totalCount: histories.length,
            data: histories
        });
    } catch (error) {
        console.error("Monitoring historical pull err:", error);
        res.status(500).json({ success: false, error: "Server error querying monitoring histories" });
    }
});

// @route   GET /api/msmes/:id/baseline-average
// @desc    Calculate general baseline consumption metric averages
router.get('/:id/baseline-average', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;
        const results = await calculateBaselineAverage(msmeId);

        if (results.error) {
             return res.status(404).json({ success: false, error: results.error });
        }

        res.status(200).json({
            success: true,
            data: {
                averageConsumption: results.averageConsumption,
                totalReadings: results.totalReadings,
                minValue: results.minValue,
                maxValue: results.maxValue,
                unit: results.unit
            }
        });

    } catch (error) {
        console.error("Calculation fetch err:", error);
        res.status(500).json({ success: false, error: "Server issue generating average maths" });
    }
});

// @route   GET /api/msmes/:id/emission-status
// @desc    Produce overarching summary combining Base and Monitor delta
router.get('/:id/emission-status', checkMSMEAccess, async (req, res) => {
    try {
        const msmeId = req.params.id;

        const msmeData = await MSME.findById(msmeId);
        if (!msmeData) {
            return res.status(404).json({ success: false, error: "MSME Identity mismatch." });
        }

        const baseAverages = await calculateBaselineAverage(msmeId);
        if (baseAverages.error) return res.status(404).json({ success: false, error: "Missing required baselines to calculate." });

        // Retrieve latest submitted monitor parameter
        const latestMonitor = await MonitoringReading.findOne({ msme: msmeId }).sort({ readingDate: -1 });
        if (!latestMonitor) return res.status(404).json({ success: false, error: "No ongoing monitoring logs established yet to compare against." });

        const reducedMetrics = calculateEmissionReduction(baseAverages.averageConsumption, latestMonitor.energyConsumption);
        const baselineTotalCount = await BaselineReading.countDocuments({ msme: msmeId });
        const monitorTotalCount = await MonitoringReading.countDocuments({ msme: msmeId });

        res.status(200).json({
            success: true,
            data: {
                msmeName: msmeData.msmeName,
                baselineAverage: reducedMetrics.baselineAverage,
                latestMonitoring: reducedMetrics.monitoringConsumption,
                emissionReduction: reducedMetrics.emissionReduction,
                reductionPercentage: reducedMetrics.reductionPercentage,
                status: reducedMetrics.status,
                readingsCount: {
                    baseline: baselineTotalCount,
                    monitoring: monitorTotalCount
                }
            }
        });

    } catch (error) {
        console.error("Emission reduction fetch err:", error);
        res.status(500).json({ success: false, error: "Server issue calculating final baseline reduction equations." });
    }
});

module.exports = router;
