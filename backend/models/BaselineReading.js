const mongoose = require('mongoose');

const baselineReadingSchema = new mongoose.Schema({
    msme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MSME",
        required: true
    },
    energyConsumption: {
        type: Number,
        required: true // e.g., 120000
    },
    unit: {
        type: String,
        enum: ["kWh", "Litres", "Tonnes", "MWh"],
        required: true
    },
    readingDate: {
        type: Date,
        required: true // when this reading was taken; e.g., "2024-01-01"
    },
    notes: {
        type: String // optional; any notes about this reading
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index on msme + readingDate to prevent exact duplicates and speed up queries
baselineReadingSchema.index({ msme: 1, readingDate: 1 }, { unique: true });

module.exports = mongoose.model("BaselineReading", baselineReadingSchema);
