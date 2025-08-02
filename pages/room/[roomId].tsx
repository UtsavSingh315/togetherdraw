import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DrawingRoom from "../drawing-room";
import { LoadingHearts } from "../../components/shared/LoadingHearts";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { SocketManager } from "../../components/connection/SocketManager";

interface RoomPageProps {}

export default function RoomPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [userName, setUserName] = useState("");
  const [roomStatus, setRoomStatus] = useState<
    "loading" | "joining" | "waiting_approval" | "active" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    console.log(
      "🔍 RoomPage useEffect - roomId:",
      roomId,
      "type:",
      typeof roomId
    );
    if (roomId && typeof roomId === "string") {
      // Check if user is the host of this room
      const hostName = localStorage.getItem(`room_${roomId}_host`);
      const savedName = localStorage.getItem(`room_${roomId}_user`);

      console.log("� Host name for room:", hostName);
      console.log("�💾 Saved name for room:", savedName);

      if (hostName && savedName && hostName === savedName) {
        // User is the host, automatically log them in
        console.log("🎯 User is the host, auto-logging in");
        setUserName(savedName);
        setRoomStatus("active");
        setUser({
          name: savedName,
          role: "host",
          roomCode: roomId as string,
        });
      } else if (savedName) {
        // User is a returning guest
        console.log("🔄 User is a returning guest");
        setUserName(savedName);
        setRoomStatus("joining");
        setUser({
          name: savedName,
          role: "guest",
          roomCode: roomId as string,
        });
      } else {
        // New user, show join form
        console.log("👤 New user, showing join form");
        setRoomStatus("loading");
      }
    }
  }, [roomId]);

  const handleJoinRoom = (name: string) => {
    if (!name.trim() || !roomId) return;

    setUserName(name);
    localStorage.setItem(`room_${roomId}_user`, name);
    setRoomStatus("joining");

    // This will trigger the SocketManager to join the room
    setUser({
      name: name,
      role: "guest",
      roomCode: roomId as string,
    });
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleUserJoined = (data: { name: string; count: number }) => {
    setPartnerName(data.name);
  };

  const handleUserLeft = (data: { name: string; count: number }) => {
    setPartnerName(null);
  };

  const handleDataReceived = (data: any) => {
    // Handle drawing data if needed
  };

  const setIsLoading = (loading: boolean) => {
    // Only handle loading state changes, not room activation
    console.log("🔄 Loading state changed:", loading);
  };

  const handleRoomActive = () => {
    // This is called specifically when the room becomes active
    console.log("🎯 Room is now active, transitioning to drawing interface");
    setRoomStatus("active");
  };

  const handleSetPartnerName = (name: string | null) => {
    setPartnerName(name);
  };

  const handleRoomCreated = (roomCode: string) => {
    // This shouldn't happen on the room page, but handle it anyway
    console.log("🏠 Room created on room page:", roomCode);
  };

  const handleBackToHome = () => {
    // Clean up localStorage for this room
    if (roomId) {
      localStorage.removeItem(`room_${roomId}_user`);
      localStorage.removeItem(`room_${roomId}_host`);
    }
    router.push("/");
  };

  if (roomStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-pink-600">
              Join Drawing Room 💕
            </CardTitle>
            <CardDescription>Room ID: {roomId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                onKeyPress={(e) =>
                  e.key === "Enter" && handleJoinRoom(userName)
                }
              />
            </div>
            <Button
              onClick={() => handleJoinRoom(userName)}
              className="w-full"
              disabled={!userName.trim()}>
              Join Room
            </Button>
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roomStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Room Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{errorMessage}</p>
            <Button onClick={handleBackToHome} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roomStatus === "waiting_approval") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">
              Waiting for Approval 💙
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <LoadingHearts message="Waiting for the room host to approve your request..." />
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full">
              Cancel & Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && roomStatus === "active") {
    return <DrawingRoom user={user} onBack={handleBackToHome} />;
  }

  return (
    <>
      {user && (
        <SocketManager
          user={user}
          onConnectionChange={handleConnectionChange}
          onUserJoined={handleUserJoined}
          onUserLeft={handleUserLeft}
          onDataReceived={handleDataReceived}
          setPartnerName={handleSetPartnerName}
          setIsLoading={setIsLoading}
          onRoomActive={handleRoomActive}
          onRoomCreated={handleRoomCreated}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <LoadingHearts message="Connecting to room..." />
      </div>
    </>
  );
}
