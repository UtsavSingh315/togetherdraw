const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store active rooms and users with approval system
const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    // Optimize Socket.IO settings to reduce polling frequency
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    allowUpgrades: true,
    transports: ["websocket", "polling"],
    // Reduce polling frequency
    pollingDuration: 30000,
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
    socket.on("join-room", ({ roomId, userName }) => {
      console.log(`${userName} attempting to join room ${roomId}`);

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      if (room.guest) {
        socket.emit("room-error", { message: "Room is full" });
        return;
      }

      // Add guest to room (pending approval)
      room.guest = { id: socket.id, name: userName, approved: false };
      room.status = "pending_approval";

      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;
      socket.userRole = "guest";

      // Notify host about join request
      io.to(room.host.id).emit("join-request", {
        guestName: userName,
        roomId,
      });

      // Notify guest about pending approval
      socket.emit("awaiting-approval", {
        hostName: room.host.name,
        roomId,
      });

      console.log(
        `${userName} requesting to join room ${roomId}, awaiting host approval`
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

          // Clean up room if both users are gone
          if (socket.userRole === "host") {
            rooms.delete(socket.roomId);
            console.log(`Room ${socket.roomId} deleted (host left)`);
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
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
