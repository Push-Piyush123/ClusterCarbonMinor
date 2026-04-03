const mongoose = require('mongoose');

const monitoringReadingSchema = new mongoose.Schema({
    msme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MSME",
        required: true
    },
    energyConsumption: {
        type: Number,
        required: true // e.g., 100000
    },
    unit: {
        type: String,
        enum: ["kWh", "Litres", "Tonnes", "MWh"],
        required: true
    },
    readingDate: {
        type: Date,
        required: true // the date of this monitoring reading
    },
    periodStart: {
        type: Date // optional; if this is a period reading, when did it start?
    },
    periodEnd: {
        type: Date // optional; when did the period end?
    },
    notes: {
        type: String // optional
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index on msme + readingDate to prevent exact duplicates on the same day
monitoringReadingSchema.index({ msme: 1, readingDate: 1 }, { unique: true });

module.exports = mongoose.model("MonitoringReading", monitoringReadingSchema);
