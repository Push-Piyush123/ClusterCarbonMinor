const mongoose = require('mongoose');

const verifierSchema = new mongoose.Schema({
    // --- Professional Information ---
    verifierName: {
        type: String, // Verifier / Auditor Name
        required: true,
    },
    agencyName: {
        type: String, // Agency Name (If applicable)
    },
    accreditationId: {
        type: String,
        // required: true,
        unique: true, // Prevents duplicate registrations
    },

    // --- Expertise ---
    areaOfExpertise: {
        type: String,
        enum: [
            "Industrial Energy Efficiency",
            "Renewable Energy Projects",
            "Waste Management",
            "Forestry & Land Use",
            "General Verification"
        ],
        required: true,
    },

    // --- Contact Information ---
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

    // --- Accreditation & Legal ---
    // Will capture the local path from the multer middleware mapped up in authRoutes
    accreditationCertificate: {
        fileName: String,
        filePath: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
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

const Verifier = mongoose.model("Verifier", verifierSchema);
module.exports = Verifier;
