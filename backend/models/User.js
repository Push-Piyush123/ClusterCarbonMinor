const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Do not return password by default in queries
    },
    role: {
        type: String,
        enum: ["MSME", "Company", "Aggregator", "Verifier", "Admin"],
        default: "Company",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash the password before saving to the database
// We use a pre('save') hook so that anytime a user is created or updated,
// if the password was modified, it will automatically get hashed.
userSchema.pre('save', async function (next) {
    // Only hash the password if it's new or has been modified
    if (!this.isModified('password')) {
        next();
    }

    // Generate a salt with 10 rounds, which is standard
    const salt = await bcrypt.genSalt(10);
    // Overwrite the plain-text password with the hash
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
