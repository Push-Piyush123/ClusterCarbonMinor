const mongoose = require('mongoose');

const msmeSchema = new mongoose.Schema({
    // --- Business Information ---
    msmeName: {
        type: String,
        required: true,
    },
    yearsInOperation: {
        type: Number,
        required: true,
    },
    udyamRegistrationId: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate UDYAM IDs
    },
    country: {
        type: String,
        default: "India",
    },
    industrySector: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    businessCategory: {
        type: String,
        enum: ["Micro", "Small", "Medium"],
        required: true,
    },
    cityTown: {
        type: String,
        required: true,
    },

    // --- Cluster Information (Optional) ---
    industrialClusterArea: {
        type: String,
    },
    clusterPincode: {
        type: String,
    },

    // --- Baseline Emissions Profile ---
    primaryFuelType: {
        type: String,
        required: true,
    },
    productionUnitType: {
        type: String,
        required: true,
    },
    annualEnergyConsumption: {
        type: Number,
        required: true,
    },
    energyUnit: {
        type: String,
        enum: ["kWh", "Liters", "Tonnes"],
        required: true,
    },
    peakOperatingMonths: {
        type: String,
        required: true,
    },
    annualEstimatedCO2Emissions: {
        type: Number,
        required: true,
    },
    annualOperatingHours: {
        type: Number,
    },
    productionCapacity: {
        type: Number,
    },

    // --- Energy Efficiency Projects ---
    energyProjectType: {
        type: String,
        required: true,
    },
    equipmentDetails: {
        type: String,
        required: true,
    },
    projectStartDate: {
        type: Date,
        required: true,
    },
    estimatedCompletionDate: {
        type: Date,
        required: true,
    },
    expectedEmissionReduction: {
        type: Number,
        required: true,
    },

    // --- Monitoring & Data ---
    smartMeterAvailable: {
        type: String,
        enum: ["Yes, installed", "Will install", "No, manual tracking"],
        required: true,
    },
    dataSubmissionFrequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly"],
        required: true,
    },

    // --- Contact & Legal ---
    ownerName: {
        type: String,
        required: true,
    },
    gstNumber: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    panNumber: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },

    // --- Linkage & Meta ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const MSME = mongoose.model("MSME", msmeSchema);
module.exports = MSME;
