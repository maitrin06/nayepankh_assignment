import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;
const userSockets = new Map<string, string>(); // Maps userId -> socketId

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user ID
    socket.on('register_user', (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`User registered: UserID ${userId} mapped to SocketID ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Clean up mapping
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User logged out / disconnected: UserID ${userId}`);
          break;
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const sendRealTimeNotification = (userId: string, message: string, type: string = 'general') => {
  try {
    const socketId = userSockets.get(userId);
    const notificationPayload = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      read: false,
      createdAt: new Date(),
    };

    if (socketId && io) {
      io.to(socketId).emit('notification', notificationPayload);
      console.log(`[Socket.io] Real-time notification sent to User ${userId}`);
    } else {
      console.log(`[Socket.io] User ${userId} is offline. Notification saved to DB only.`);
    }
  } catch (error) {
    console.error('Error sending socket notification:', error);
  }
};
