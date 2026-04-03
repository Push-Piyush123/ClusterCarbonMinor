const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    // --- Company Information ---
    companyName: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: true, // CIN or comparable
    },
    industryType: {
        type: String,
        required: true,
    },
    companySize: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: "India",
    },
    state: {
        type: String,
        required: true,
    },

    // --- Sustainability Profile ---
    annualCO2Emissions: {
        type: Number,
        // Optional field
    },
    sustainabilityDetails: {
        type: String,
        // Optional field
    },
    netZeroTargetYear: {
        type: Number,
        // Optional field
    },
    expectedAnnualCreditPurchase: {
        type: Number,
        // Optional field
    },

    // --- Contact Information ---
    primaryContactName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },

    // --- Financial & Legal ---
    gstNumber: {
        type: String,
        required: true,
    },
    officeAddress: {
        type: String,
        required: true,
    },
    panNumber: {
        type: String,
        required: true,
    },
    preferredContactMethod: {
        type: String,
        enum: ["Email", "Phone", "Both"],
        default: "Email",
    },

    // Link this company profile back to the core authed User
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

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
