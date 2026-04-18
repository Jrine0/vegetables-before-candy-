"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3002",
        methods: ["GET", "POST"],
        credentials: true
    }
});
exports.prisma = new client_1.PrismaClient();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/api', (req, res) => {
    res.json({
        message: 'future me API',
        version: '1.0.0',
        status: 'running'
    });
});
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });
    socket.on('nft-minted', (data) => {
        socket.broadcast.emit('nft-minted-notification', data);
    });
    socket.on('disconnect', () => {
        console.log(`👤 User disconnected: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
});
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server gracefully...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
