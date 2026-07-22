import { Server } from "socket.io";

let io;

/**
 * Initialize Socket.io server
 * Attaches to the HTTP server and configures CORS.
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room based on user role for targeted notifications
    socket.on("join", (data) => {
      if (data?.role) {
        socket.join(data.role);
        console.log(`${socket.id} joined room: ${data.role}`);
      }
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Send a real-time notification to connected clients.
 * Can target specific rooms (roles) or broadcast to all.
 */
export const sendNotification = (event, data, room = null) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

export const getIO = () => io;
