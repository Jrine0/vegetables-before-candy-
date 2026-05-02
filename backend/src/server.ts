import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import achievementRoutes from './routes/achievements';
import taskRoutes from './routes/tasks';
import opportunityRoutes from './routes/opportunities';
import socialRoutes from './routes/social';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their personal room for targeted notifications
  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join university room for university-wide updates
  socket.on('join-university', (university: string) => {
    socket.join(`university-${university}`);
    console.log(`User joined ${university} room`);
  });

  // Handle real-time achievement submissions
  socket.on('achievement-submitted', (data) => {
    // Broadcast to university room
    socket.to(`university-${data.university}`).emit('new-achievement', data);
    // Broadcast to global feed
    socket.broadcast.emit('achievement-feed-update', data);
  });

  // Handle NFT minting events
  socket.on('nft-minted', (data) => {
    socket.to(`user-${data.userId}`).emit('nft-minted-success', data);
    socket.broadcast.emit('nft-gallery-update', data);
  });

  // Handle leaderboard updates
  socket.on('request-leaderboard', () => {
    // This will be implemented with the leaderboard feature
    socket.emit('leaderboard-update', { message: 'Leaderboard requested' });
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server with WebSocket running on port ${PORT}`);
});

// Export Socket.IO instance for use in routes
export { io };

// Export Prisma instance
export { prisma };

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});