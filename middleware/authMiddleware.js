// Simple auth middleware (optional for now)
const authMiddleware = (req, res, next) => {
    // For now, just pass through
    // You can add token verification later
    next();
};

module.exports = authMiddleware;