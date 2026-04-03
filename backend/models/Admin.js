const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    // --- Professional Information ---
    adminName: {
        type: String, // Administrator Name
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Same as user email
        lowercase: true,
        trim: true,
    },

    // --- Department & Authorization ---
    department: {
        type: String, // e.g., "IT", "Compliance", "Operations"
    },

    // --- Linkage & Meta ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Link to auth user
    },
    inviteCode: {
        type: String, // Track which code was used for this registration
    },
    isActive: {
        type: Boolean,
        default: true, // Allow admins to be deactivated
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});



const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;

