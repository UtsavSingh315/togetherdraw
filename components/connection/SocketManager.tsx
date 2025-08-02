import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// Dynamic socket URL that works in any environment
const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    // In browser, use the current origin
    return window.location.origin;
  }
  // Server-side rendering
  return process.env.NODE_ENV === "production"
    ? process.env.APP_URL || "http://localhost:3000"
    : "http://localhost:3000";
};

const SOCKET_URL = getSocketUrl();

interface User {
  name: string;
  role: string;
  roomCode: string;
}

interface SocketManagerProps {
  user: User;
  onDataReceived: (data: any) => void;
  onUserJoined: (data: { name: string; count: number }) => void;
  onUserLeft: (data: { name: string; count: number }) => void;
  onConnectionChange: (connected: boolean) => void;
  setPartnerName: (name: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  onRoomActive?: () => void;
  onRoomCreated?: (roomCode: string) => void;
}

export const SocketManager: React.FC<SocketManagerProps> = ({
  user,
  onConnectionChange,
  onDataReceived,
  onUserJoined,
  onUserLeft,
  onRoomActive,
  onRoomCreated,
  setPartnerName,
  setIsLoading,
}) => {
  console.log("🔧 SocketManager mounted with user:", user);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to store the latest callback functions to prevent dependency loops
  const callbacksRef = useRef({
    onConnectionChange,
    onDataReceived,
    onUserJoined,
    onUserLeft,
    onRoomActive,
    onRoomCreated,
    setPartnerName,
    setIsLoading,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onConnectionChange,
      onDataReceived,
      onUserJoined,
      onUserLeft,
      onRoomActive,
      onRoomCreated,
      setPartnerName,
      setIsLoading,
    };
  }, [
    onConnectionChange,
    onDataReceived,
    onUserJoined,
    onUserLeft,
    onRoomActive,
    onRoomCreated,
    setPartnerName,
    setIsLoading,
  ]);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("🔌 Socket already connected");
      return socketRef.current;
    }

    console.log("🚀 Connecting to socket...");
    console.log("🌐 Socket URL:", SOCKET_URL);
    console.log("👤 User:", user);
    callbacksRef.current.setIsLoading(true);

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000, // Increased for Render's network
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      reconnection: true, // Enable reconnection for Render
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      callbacksRef.current.setIsLoading(false);
      callbacksRef.current.onConnectionChange(true);

      // Handle room creation or joining after connection
      if (user.roomCode === "creating") {
        console.log("🏗️ Creating new room for:", user.name);
        socket.emit("create-room", { userName: user.name });
      } else {
        console.log("🚪 Joining room:", user.roomCode, "as:", user.name);
        socket.emit("join-room", {
          roomId: user.roomCode,
          userName: user.name,
          userRole: user.role,
        });
      }
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Connection error:", error);
      callbacksRef.current.setIsLoading(false);
      callbacksRef.current.onConnectionChange(false);

      // For Render deployment, allow Socket.IO to handle reconnection
      console.log("🔄 Connection failed, Socket.IO will retry automatically");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
      callbacksRef.current.setIsLoading(false);
      callbacksRef.current.onConnectionChange(false);
    });

    socket.on("room-joined", (data) => {
      console.log("🏠 Joined room:", data);
      callbacksRef.current.setIsLoading(false);

      // Notify that room is active
      if (callbacksRef.current.onRoomActive) {
        callbacksRef.current.onRoomActive();
      }
    });

    socket.on("room-created", (data) => {
      console.log("🏗️ Room created:", data);
      callbacksRef.current.setIsLoading(false);

      // Update the user object with the actual room ID
      user.roomCode = data.roomId;

      // Notify that room was created for URL redirection
      if (callbacksRef.current.onRoomCreated) {
        callbacksRef.current.onRoomCreated(data.roomId);
      }

      // Notify that room is active
      if (callbacksRef.current.onRoomActive) {
        callbacksRef.current.onRoomActive();
      }
    });

    socket.on("drawing-data", (data) => {
      console.log("🎨 Received drawing data:", data);
      callbacksRef.current.onDataReceived(data);
    });

    socket.on("canvas-state", (data) => {
      console.log("🖼️ Received canvas state:", data);
      callbacksRef.current.onDataReceived(data);
    });

    socket.on("user-joined", (data) => {
      console.log("👋 User joined:", data);
      callbacksRef.current.setPartnerName(data.userName);
      callbacksRef.current.onUserJoined(data);
    });

    socket.on("user-left", (data) => {
      console.log("👋 User left:", data);
      callbacksRef.current.setPartnerName(null);
      callbacksRef.current.onUserLeft(data);
    });

    // Handle room joining events
    socket.on("awaiting-approval", (data) => {
      console.log("⏳ Awaiting approval from host:", data);
      // This is handled in the room page component
    });

    socket.on("room-active", (data) => {
      console.log("🎯 Room is now active:", data);
      callbacksRef.current.setIsLoading(false);

      // Set partner name
      const partnerName = data.host === user.name ? data.guest : data.host;
      callbacksRef.current.setPartnerName(partnerName);

      // Notify that room is active
      if (callbacksRef.current.onRoomActive) {
        callbacksRef.current.onRoomActive();
      }
    });

    socket.on("room-error", (data) => {
      console.log("❌ Room error:", data);
      callbacksRef.current.setIsLoading(false);
      // Handle room error - could show toast or error message
    });

    socket.on("join-rejected", (data) => {
      console.log("❌ Join request rejected:", data);
      callbacksRef.current.setIsLoading(false);
      // Handle rejection - could redirect back to home
    });

    return socket;
  }, [user.name, user.role, user.roomCode]); // Only include stable dependencies

  useEffect(() => {
    const socket = connectSocket();

    return () => {
      if (socket) {
        console.log("🔌 Cleaning up socket connection");
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  const sendDrawingData = useCallback((data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("drawing-data", data);
    }
  }, []);

  const sendCanvasState = useCallback((data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("canvas-state", data);
    }
  }, []);

  // Expose methods for the canvas to use
  (SocketManager as any).sendDrawingData = sendDrawingData;
  (SocketManager as any).sendCanvasState = sendCanvasState;

  return null;
};

export default SocketManager;
