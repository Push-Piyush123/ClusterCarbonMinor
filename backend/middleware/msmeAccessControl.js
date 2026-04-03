const MSME = require("../models/MSME");

// Middleware to check if user can access specific MSME data based on roles
const checkMSMEAccess = async (req, res, next) => {
    try {
        const msmeId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Admin and Aggregator can globally access / view any MSME performance
        if (userRole === "Admin" || userRole === "Aggregator") {
            return next();
        }

        // Standard MSME profiles can strictly only review and upload for their own matching ID
        if (userRole === "MSME") {
            const msme = await MSME.findById(msmeId);
            if (!msme) {
                return res.status(404).json({ error: "MSME not found inside access controller target" });
            }
            
            // Validate mapping
            if (msme.user.toString() !== userId.toString()) {
                return res.status(403).json({ error: "You can only access your own assigned MSME data pool" });
            }
            
            return next();
        }

        // Everyone else (e.g. Verifier, generic Company buyers) gets locked out from direct data edits
        return res.status(403).json({ error: "Unauthorized: You do not have permission to access active MSME data blocks" });

    } catch (error) {
        console.error("Middleware Access Control Error:", error);
        return res.status(500).json({ error: "Access control check operation failed" });
    }
};

module.exports = { checkMSMEAccess };
