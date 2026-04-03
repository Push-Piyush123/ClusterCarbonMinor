const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
    // --- Linkage ---
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cluster",
        required: true
    },
    msme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MSME",
        required: true
    },
    emissionSummary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmissionSummary",
        required: true
    },
    riskScore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RiskScore",
        required: true
    },

    // --- Time Period ---
    period: {
        type: String,
        required: true // e.g., "June 2024"
    },
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },

    // --- Credit Allocation Metrics ---
    initialCreditsIssued: {
        type: Number,
        required: true
    },
    riskFactor: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    effectiveCreditsAllocated: {
        type: Number,
        required: true
    },
    
    // --- Contribution Metrics ---
    clusterTotalInitialCredits: {
        type: Number
    },
    msmeContributionPercentage: {
        type: Number
    },
    msmeEffectivePercentage: {
        type: Number
    },

    // --- Workflow & Auditing ---
    status: {
        type: String,
        enum: ["Allocated", "Pending Verification", "Verified", "Claimed"],
        default: "Allocated"
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Verifier"
    },
    verifiedAt: {
        type: Date
    },
    verificationNotes: {
        type: String
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    claimedAt: {
        type: Date
    },

    // --- Metadata ---
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Indexes
allocationSchema.index({ cluster: 1, period: 1 });
allocationSchema.index({ msme: 1, periodStart: 1 });
allocationSchema.index({ status: 1 });

module.exports = mongoose.model("Allocation", allocationSchema);
