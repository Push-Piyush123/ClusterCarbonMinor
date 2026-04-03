const mongoose = require('mongoose');

const inviteCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // e.g., "12345678", 8 digits
    },
    isUsed: {
        type: Boolean,
        default: false, // marks if this code has been used
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // tracks which user used this code
    },
    usedAt: {
        type: Date, // timestamp when code was used
    },
    expiresAt: {
        type: Date,
        required: true, // invite codes expire after X days
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // which admin generated this code
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const InviteCode = mongoose.model("InviteCode", inviteCodeSchema);
module.exports = InviteCode;
