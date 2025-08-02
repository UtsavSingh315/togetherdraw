// This file initializes Socket.IO server for Next.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      // Your socket event handlers here
    });

    res.socket.server.io = io;
  }
  res.end();
}
