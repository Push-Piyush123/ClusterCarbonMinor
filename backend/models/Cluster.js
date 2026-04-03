const mongoose = require("mongoose");

const clusterSchema = new mongoose.Schema({
  clusterName: {
    type: String,
    required: true,
    // e.g., "Textile - Maharashtra"
  },
  sector: {
    type: String,
    required: true,
    // e.g., "Textile", "Foundry", "Food Processing"
  },
  state: {
    type: String,
    required: true,
    // e.g., "Maharashtra", "Gujarat"
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MSME"
    }
  ],
  memberCount: {
    type: Number,
    default: 0
    // count of members, for quick lookup
  },
  // Metadata
  totalBaselineAverage: {
    type: Number,
    default: 0
    // combined baseline for all members, calculated
  },
  totalEmissionReduction: {
    type: Number,
    default: 0
    // sum of all emission reductions, calculated
  },
  clusterStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  lastRecomputedAt: {
    type: Date
    // when clustering algorithm last ran
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add unique compound index ensuring only one cluster per sector+state combination
clusterSchema.index({ sector: 1, state: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
clusterSchema.pre("save", async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Cluster", clusterSchema);
