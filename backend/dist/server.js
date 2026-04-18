"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const achievements_1 = __importDefault(require("./routes/achievements"));
const nfts_1 = __importDefault(require("./routes/nfts"));
const opportunities_1 = __importDefault(require("./routes/opportunities"));
const social_1 = __importDefault(require("./routes/social"));
const aptos_1 = __importDefault(require("./routes/aptos"));
const analytics_1 = __importDefault(require("./routes/analytics"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});
exports.io = io;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 3001;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static('uploads'));
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/achievements', achievements_1.default);
app.use('/api/nfts', nfts_1.default);
app.use('/api/opportunities', opportunities_1.default);
app.use('/api/social', social_1.default);
app.use('/api/aptos', aptos_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their personal room`);
    });
    socket.on('join-university', (university) => {
        socket.join(`university-${university}`);
        console.log(`User joined ${university} room`);
    });
    socket.on('achievement-submitted', (data) => {
        socket.to(`university-${data.university}`).emit('new-achievement', data);
        socket.broadcast.emit('achievement-feed-update', data);
    });
    socket.on('nft-minted', (data) => {
        socket.to(`user-${data.userId}`).emit('nft-minted-success', data);
        socket.broadcast.emit('nft-gallery-update', data);
    });
    socket.on('request-leaderboard', () => {
        socket.emit('leaderboard-update', { message: 'Leaderboard requested' });
    });
    socket.on('disconnect', () => {
        console.log('👤 User disconnected:', socket.id);
    });
});
httpServer.listen(PORT, () => {
    console.log(`🚀 Server with WebSocket running on port ${PORT}`);
});
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
