const jwt = require("jsonwebtoken");
const User = require("../models/users");

const AuthMiddlerware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const token = headerToken || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

const authOptional = (req, res, next) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch {
            // expired/invalid → treat as guest
        }
    }

    return next();
};

const Authorize = (roles) => (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (req.user && allowedRoles.includes(req.user.role)) {
        return next();
    }

    return res.status(403).json({ message: "Not authorized" });
};

module.exports = AuthMiddlerware;
module.exports.AuthMiddlerware = AuthMiddlerware;
module.exports.protect = AuthMiddlerware;
module.exports.authOptional = authOptional;
module.exports.Authorize = Authorize;