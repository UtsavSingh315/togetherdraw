const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0"; // Bind to all interfaces in production
const port = process.env.PORT || 3000;

console.log(`🚀 Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`🌐 Hostname: ${hostname}, Port: ${port}`);

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store active rooms and users with approval system
const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Optimized settings for Render deployment
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    allowUpgrades: true,
    transports: ["websocket", "polling"],
    // Allow WebSocket connections
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    console.log("🎉 User connected to Socket.IO:", socket.id);
    console.log("📡 Connection transport:", socket.conn.transport.name);

    // Log when transport upgrades (polling -> websocket)
    socket.conn.on("upgrade", () => {
      console.log("⬆️ Connection upgraded to:", socket.conn.transport.name);
    });

    // Handle creating a new room
    socket.on("create-room", ({ userName }) => {
      const roomId = generateRoomId();
      console.log(`${userName} creating room ${roomId}`);

      // Initialize room with creator as host
      rooms.set(roomId, {
        host: { id: socket.id, name: userName, approved: true },
        guest: null,
        status: "waiting", // waiting, pending_approval, active
        createdAt: Date.now(),
      });

      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;
      socket.userRole = "host";

      // Send room URL to creator
      socket.emit("room-created", {
        roomId,
        roomUrl: `http://localhost:${port}/room/${roomId}`,
        userName,
      });

      console.log(`Room ${roomId} created by ${userName}`);
    });

    // Handle joining an existing room
    socket.on("join-room", ({ roomId, userName, userRole }) => {
      console.log(
        `${userName} attempting to join room ${roomId} as ${
          userRole || "unknown"
        }`
      );

      const room = rooms.get(roomId);
      if (!room) {
        console.log(`❌ Room ${roomId} not found`);
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      // Check if this is the host reconnecting
      if (userRole === "host" && room.host.name === userName) {
        console.log(`🔄 Host ${userName} reconnecting to room ${roomId}`);

        // Clear grace period
        if (room.hostDisconnectedAt) {
          delete room.hostDisconnectedAt;
          console.log(`✅ Cleared grace period for room ${roomId}`);
        }

        // Update host socket ID
        room.host.id = socket.id;

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userName = userName;
        socket.userRole = "host";

        // Notify host that they've rejoined successfully
        socket.emit("room-joined", {
          roomId,
          role: "host",
          partnerName: room.guest ? room.guest.name : null,
        });

        // If room has an active guest, notify both users that room is active
        if (room.guest && room.guest.approved) {
          io.to(roomId).emit("room-active", {
            host: room.host.name,
            guest: room.guest.name,
            roomId,
          });
        }

        console.log(
          `Host ${userName} successfully reconnected to room ${roomId}`
        );
        return;
      }

      // Regular guest joining logic
      if (room.guest) {
        socket.emit("room-error", { message: "Room is full" });
        return;
      }

      // Add guest to room and auto-approve for now
      room.guest = { id: socket.id, name: userName, approved: true };
      room.status = "active";

      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;
      socket.userRole = "guest";

      // Notify both users that room is now active
      io.to(roomId).emit("room-active", {
        host: room.host.name,
        guest: room.guest.name,
        roomId,
      });

      console.log(
        `${userName} joined room ${roomId} and was auto-approved. Room is now active.`
      );
    });

    // Handle host approval/rejection
    socket.on("approve-guest", ({ roomId, approved }) => {
      const room = rooms.get(roomId);
      if (!room || !room.guest || socket.id !== room.host.id) {
        return;
      }

      if (approved) {
        // Approve the guest
        room.guest.approved = true;
        room.status = "active";

        // Notify both users that room is now active
        io.to(roomId).emit("room-active", {
          host: room.host.name,
          guest: room.guest.name,
          roomId,
        });

        console.log(
          `Room ${roomId} is now active with ${room.host.name} and ${room.guest.name}`
        );
      } else {
        // Reject the guest
        const guestSocketId = room.guest.id;
        room.guest = null;
        room.status = "waiting";

        // Notify guest of rejection
        io.to(guestSocketId).emit("join-rejected", { roomId });

        console.log(`Guest rejected from room ${roomId}`);
      }
    });

    // Handle drawing data (only in active rooms)
    socket.on("drawing-data", (data) => {
      const room = rooms.get(socket.roomId);
      if (room && room.status === "active") {
        console.log(
          `Drawing data from ${socket.userName} in room ${socket.roomId}`
        );
        socket.to(socket.roomId).emit("drawing-data", {
          ...data,
          user: socket.userName,
          socketId: socket.id,
        });
      }
    });

    // Handle cursor movement (only in active rooms)
    socket.on("cursor-move", (data) => {
      const room = rooms.get(socket.roomId);
      if (room && room.status === "active") {
        socket.to(socket.roomId).emit("cursor-move", {
          ...data,
          user: socket.userName,
          socketId: socket.id,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`💔 User disconnected: ${socket.userName || socket.id}`);

      if (socket.roomId) {
        const room = rooms.get(socket.roomId);
        if (room) {
          // Notify the other user about disconnection
          socket.to(socket.roomId).emit("partner-disconnected", {
            userName: socket.userName,
          });

          if (socket.userRole === "host") {
            // Give host 10 seconds to reconnect before deleting room
            console.log(
              `⏰ Host left room ${socket.roomId}, starting 10s grace period`
            );
            room.hostDisconnectedAt = Date.now();

            setTimeout(() => {
              const currentRoom = rooms.get(socket.roomId);
              if (currentRoom && currentRoom.hostDisconnectedAt) {
                // Check if host is still disconnected after grace period
                if (Date.now() - currentRoom.hostDisconnectedAt >= 10000) {
                  rooms.delete(socket.roomId);
                  console.log(
                    `Room ${socket.roomId} deleted (host didn't return)`
                  );
                }
              }
            }, 10000);
          } else if (socket.userRole === "guest") {
            room.guest = null;
            room.status = "waiting";
            console.log(
              `Guest left room ${socket.roomId}, room back to waiting`
            );
          }
        }
      }
    });
  });

  // Generate unique room ID
  function generateRoomId() {
    return (
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      Math.random().toString(36).substring(2, 4).toUpperCase()
    );
  }

  // Clean up old empty rooms periodically
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
      // Remove rooms older than 1 hour with no activity
      if (now - room.createdAt > 3600000 && room.status === "waiting") {
        rooms.delete(roomId);
        console.log(`🧹 Cleaned up old room: ${roomId}`);
      }
    }
  }, 300000); // Check every 5 minutes

  httpServer
    .once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`✅ Ready on http://${hostname}:${port}`);
      console.log(`🌐 App URL: ${process.env.APP_URL || 'Not set'}`);
      console.log(`🔌 Socket.IO server running with WebSocket support`);
    });
});
