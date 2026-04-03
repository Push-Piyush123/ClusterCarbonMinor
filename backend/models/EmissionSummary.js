const mongoose = require("mongoose");

const emissionSummarySchema = new mongoose.Schema({
  // Cluster & MSME linkage
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
  
  // Time period
  period: {
    type: String,
    required: true // e.g., "June 2024", "Q2-2024", "Apr-Jun 2024"
  },
  periodStart: {
    type: Date,
    required: true // start of monitoring period
  },
  periodEnd: {
    type: Date,
    required: true // end of monitoring period
  },
  
  // MSME energy data
  baselineConsumption: {
    type: Number,
    required: true // in kWh/Litres/Tonnes; baseline average for this MSME
  },
  baselineUnit: {
    type: String // e.g., "kWh"
  },
  monitoringConsumption: {
    type: Number,
    required: true // actual consumption in monitoring period
  },
  monitoringUnit: {
    type: String
  },
  
  // Emission reduction calculation
  emissionReduction: {
    type: Number,
    required: true // baseline - monitoring = tCO2e reduced
  },
  reductionPercentage: {
    type: Number // emission reduction / baseline * 100; e.g., 16.67%
  },
  
  // Cluster-level data (for audit trail and allocation)
  clusterTotalReduction: {
    type: Number,
    required: true // total reduction for entire cluster in this period
  },
  msmeContributionPercentage: {
    type: Number,
    required: true // this MSME's share of cluster reduction; e.g., 37.7%
  },
  
  // Carbon credits issued
  creditsIssued: {
    type: Number,
    required: true // carbon credits allocated = emissionReduction in tCO2e
  },
  
  // Verification & status
  status: {
    type: String,
    enum: ["Calculated", "Issued", "Verified", "Claimed"],
    default: "Calculated"
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Verifier" // optional: which verifier approved this
  },
  verifiedAt: {
    type: Date // optional: when was it verified
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company" // optional: which company bought these credits  
  },
  claimedAt: {
    type: Date // optional
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast querying
emissionSummarySchema.index({ cluster: 1, period: 1 });
emissionSummarySchema.index({ msme: 1, periodStart: 1, periodEnd: 1 });
emissionSummarySchema.index({ status: 1 });

// Update the updatedAt timestamp before saving
emissionSummarySchema.pre("save", async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("EmissionSummary", emissionSummarySchema);
