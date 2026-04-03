const mongoose = require('mongoose');

const dashboardMetricsSchema = new mongoose.Schema({
    metricsType: { 
        type: String, 
        required: true // e.g., "system", "cluster", "msme"
    },
    refId: { 
        type: mongoose.Schema.Types.ObjectId,
        // Optional. null for system-wide, valid ID for cluster/msme
        default: null
    },
    period: { 
        type: String // e.g., "Monthly", "Quarterly", "June 2024"
    },
    totalCreditsIssued: { type: Number, default: 0 },
    totalCreditsVerified: { type: Number, default: 0 },
    totalCreditsClaimed: { type: Number, default: 0 },
    totalEmissionReduction: { type: Number, default: 0 },
    activeClusterCount: { type: Number, default: 0 },
    activeMSMECount: { type: Number, default: 0 },
    averageRiskFactor: { type: Number, default: 0 },
    dataQualityScore: { type: Number, default: 0 }, // 0-100
    calculatedAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date,
        required: true // Required for TTL index
    }
});

// Indexes
dashboardMetricsSchema.index({ metricsType: 1, refId: 1, period: 1 });
// TTL Index for auto-expiration caching mechanism
dashboardMetricsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("DashboardMetrics", dashboardMetricsSchema);
