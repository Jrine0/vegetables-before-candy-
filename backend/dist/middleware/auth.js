"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerification = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await server_1.prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireEmailVerification = (req, res, next) => {
    if (!req.user?.emailVerified) {
        return res.status(403).json({ error: 'Email verification required' });
    }
    next();
};
exports.requireEmailVerification = requireEmailVerification;
