import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    methods: ["GET", "POST"],
    credentials: true
  }
});

export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3002",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'vegetables-before-candy API',
    version: '1.0.0',
    status: 'running'
  });
});

// WebSocket connection handling
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});