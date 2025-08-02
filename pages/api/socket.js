import { Server } from "socket.io";

// Store active rooms and users
const rooms = new Map();

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing Socket.IO server...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false,
      },
      allowEIO3: true,
    });

    io.on("connection", (socket) => {
      console.log("🎉 User connected to Socket.IO:", socket.id);
      console.log("📡 Connection transport:", socket.conn.transport.name);

      // Log when transport upgrades (polling -> websocket)
      socket.conn.on("upgrade", () => {
        console.log("⬆️ Connection upgraded to:", socket.conn.transport.name);
      });

      // Handle joining a room
      socket.on("join-room", ({ roomCode, userName }) => {
        console.log(`${userName} joining room ${roomCode}`);

        // Leave any previous rooms
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new room
        socket.join(roomCode);

        // Store user info
        socket.roomCode = roomCode;
        socket.userName = userName;

        // Get or create room data (using Map to track users by username)
        if (!rooms.has(roomCode)) {
          rooms.set(roomCode, new Map());
        }

        const room = rooms.get(roomCode);

        // Check if this username is already in the room
        const wasAlreadyInRoom = room.has(userName);

        // Update/add user to room (mapping username -> socket info)
        room.set(userName, { id: socket.id, name: userName });

        // Notify room about successful join
        socket.emit("room-joined", { roomCode, userName });

        // Only notify others if this is a new username joining (not a reconnection)
        if (!wasAlreadyInRoom) {
          console.log(`New user ${userName} joined room ${roomCode}`);

          // Notify existing users about the new user
          socket
            .to(roomCode)
            .emit("partner-joined", { name: userName, id: socket.id });

          // Notify the new user about existing partners
          for (const [existingUserName, userInfo] of room.entries()) {
            if (existingUserName !== userName) {
              console.log(
                `Notifying ${userName} about existing partner ${existingUserName}`
              );
              socket.emit("partner-joined", {
                name: existingUserName,
                id: userInfo.id,
              });
            }
          }
        } else {
          console.log(`User ${userName} reconnected to room ${roomCode}`);
        }

        console.log(`Room ${roomCode} now has ${room.size} users`);
      });

      // Handle drawing data
      socket.on("drawing-data", (data) => {
        if (socket.roomCode) {
          console.log(
            `Drawing data from ${socket.userName} in room ${socket.roomCode}`
          );
          socket.to(socket.roomCode).emit("drawing-data", {
            ...data,
            user: socket.userName,
            socketId: socket.id,
          });
        }
      });

      // Handle cursor movement
      socket.on("cursor-move", (data) => {
        if (socket.roomCode) {
          socket.to(socket.roomCode).emit("cursor-move", {
            ...data,
            user: socket.userName,
            socketId: socket.id,
          });
        }
      });

      // Handle canvas clear
      socket.on("canvas-clear", (data) => {
        if (socket.roomCode) {
          console.log(
            `Canvas clear from ${socket.userName} in room ${socket.roomCode}`
          );
          socket.to(socket.roomCode).emit("canvas-clear", {
            ...data,
            user: socket.userName,
            socketId: socket.id,
          });
        }
      });

      // Handle canvas undo
      socket.on("canvas-undo", (data) => {
        if (socket.roomCode) {
          console.log(
            `Canvas undo from ${socket.userName} in room ${socket.roomCode}`
          );
          socket.to(socket.roomCode).emit("canvas-undo", {
            ...data,
            user: socket.userName,
            socketId: socket.id,
          });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        if (socket.roomCode && socket.userName) {
          const room = rooms.get(socket.roomCode);
          if (room) {
            // Remove user from room by username
            room.delete(socket.userName);

            // Notify others in room about user leaving
            socket.to(socket.roomCode).emit("partner-left", {
              name: socket.userName,
              id: socket.id,
            });

            // Clean up empty rooms
            if (room.size === 0) {
              rooms.delete(socket.roomCode);
              console.log(`Room ${socket.roomCode} deleted (empty)`);
            } else {
              console.log(`Room ${socket.roomCode} now has ${room.size} users`);
            }
          }
        }
      });
    });

    res.socket.server.io = io;
    console.log("✅ Socket.IO server initialized and attached");
  } else {
    console.log("♻️ Socket.IO server already running");
  }

  // Handle GET requests for connection check
  if (req.method === "GET") {
    res.status(200).json({
      message: "Socket.IO server ready",
      socketIO: !!res.socket.server.io,
    });
    return;
  }

  res.end();
}
