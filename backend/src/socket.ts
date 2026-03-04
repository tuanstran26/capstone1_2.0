import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User join their personal room for notifications
    socket.on("join", (userId: string) => {
      if (userId) {
        const room = `user_${userId}`;
        socket.join(room);
        console.log(`👤 User ${userId} joined room: ${room}`);
      }
    });

    // User leave their room (optional, socket.io handles this on disconnect)
    socket.on("leave", (userId: string) => {
      if (userId) {
        const room = `user_${userId}`;
        socket.leave(room);
        console.log(`👤 User ${userId} left room: ${room}`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error: ${error}`);
    });
  });

  console.log("✅ Socket.io initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
}

// Helper function to send notification to a specific user
export function sendNotificationToUser(userId: string, notification: any): void {
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", notification);
  }
}

// Helper function to broadcast notification to all connected users
export function broadcastNotification(notification: any): void {
  if (io) {
    io.emit("new_notification", notification);
  }
}

// Helper function to send notification to users with specific role
export function sendNotificationToRole(role: string, notification: any): void {
  if (io) {
    io.to(`role_${role}`).emit("new_notification", notification);
  }
}
