const jwt = require('jsonwebtoken');

// authMiddleware: verify a valid JWT is present before granting access
const authMiddleware = (req, res, next) => {
    try {
        // Read token from Authorization header in format: Bearer <token>
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }

        // Extract token payload
        const token = authHeader.split(' ')[1];

        // Verify token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach req.user = { id, role } to continue the request chain
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or Expired Token." });
    }
};

// requireRole: protect route to check if they have specific string role types
// Return a middleware function tailored specifically for authorization
const requireRole = (...roles) => {
    return (req, res, next) => {
        // req.user was set from authMiddleware
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        next();
    };
};

module.exports = { authMiddleware, requireRole };
