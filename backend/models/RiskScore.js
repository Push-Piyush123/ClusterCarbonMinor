const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
    // --- Linkage ---
    msme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MSME",
        required: true
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cluster",
        required: true
    },
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

    // --- Scoring Metrics (0 to 1) ---
    dataCompletenessScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    dataConsistencyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    historicalAccuracyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },

    // --- Combined Calculation ---
    riskFactor: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    riskCategory: {
        type: String,
        enum: ["Very Low", "Low", "Medium", "High", "Critical"],
        required: true
    },
    riskNotes: {
        type: String // Optional explanation
    },

    // --- Metadata ---
    calculatedAt: {
        type: Date,
        default: Date.now
    },
    calculatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedAt: {
        type: Date
    }
});

// Indexes for fast querying and uniqueness per period
riskScoreSchema.index({ msme: 1, period: 1 }, { unique: true });
riskScoreSchema.index({ riskFactor: 1 });

module.exports = mongoose.model("RiskScore", riskScoreSchema);
