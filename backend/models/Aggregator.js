const mongoose = require('mongoose');

const aggregatorSchema = new mongoose.Schema({
    // --- Basic Information ---
    aggregatorName: {
        type: String, // Cluster / Aggregator Name
        required: true,
    },
    entityType: {
        type: String,
        enum: [
            "Industrial Cluster Aggregator",
            "Industry Association",
            "MSME Cooperative",
            "Technology Provider",
            "Other"
        ],
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },

    // --- Geographic Coverage ---
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },

    // --- Capacity & Potential ---
    annualEmissionReductionPotential: {
        type: String,
        enum: [
            "100 - 1,000 tCO₂e",
            "1,000 - 5,000 tCO₂e",
            "5,000 - 10,000 tCO₂e",
            "10,000 - 50,000 tCO₂e",
            "50,000+ tCO₂e"
        ],
        required: true,
    },

    // --- Verification & Legal ---
    // Simple MVP strategy: store the file details
    verificationDocuments: {
        fileName: String,
        filePath: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },

    // --- Terms & Agreement ---
    termsAccepted: {
        type: Boolean,
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

const Aggregator = mongoose.model("Aggregator", aggregatorSchema);
module.exports = Aggregator;
