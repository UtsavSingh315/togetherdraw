import { useState } from "react";
import { useRouter } from "next/router";
import { LoadingHearts } from "../components/shared/LoadingHearts";
import DrawingRoom from "./drawing-room";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface User {
  name: string;
  role: "host" | "guest";
  roomCode: string;
}

const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsLoading(true);

    // This will be handled by the SocketManager
    onLogin({
      name: userName.trim(),
      role: "host",
      roomCode: "creating", // Special flag for room creation
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomCode.trim()) return;

    setIsLoading(true);
    // Redirect to room URL
    router.push(`/room/${roomCode.toUpperCase()}`);
  };

  const copyRoomUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-pink-600">
            Love Draw Sync 💕
          </CardTitle>
          <CardDescription>
            Draw together in real-time with your partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roomUrl ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-600">
                  Room Created! 🎉
                </h3>
                <p className="text-sm text-gray-600">
                  Share this link with your partner:
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono break-all">{roomUrl}</p>
              </div>
              <Button onClick={copyRoomUrl} className="w-full">
                Copy Room Link
              </Button>
              <p className="text-xs text-center text-gray-500">
                Waiting for your partner to join...
              </p>
            </div>
          ) : (
            <>
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
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={isCreating ? "default" : "outline"}
                  onClick={() => setIsCreating(true)}
                  className="flex-1">
                  Create Room
                </Button>
                <Button
                  type="button"
                  variant={!isCreating ? "default" : "outline"}
                  onClick={() => setIsCreating(false)}
                  className="flex-1">
                  Join Room
                </Button>
              </div>

              {!isCreating && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room ID"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                </div>
              )}

              <Button
                onClick={isCreating ? handleCreateRoom : handleJoinRoom}
                className="w-full"
                disabled={
                  isLoading ||
                  !userName.trim() ||
                  (!isCreating && !roomCode.trim())
                }>
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingHearts message="" />
                    Creating Room...
                  </span>
                ) : isCreating ? (
                  "Create & Start Drawing"
                ) : (
                  "Join Room"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleRoomCreated = (roomCode: string) => {
    console.log("🏠 Room created, redirecting to:", `/room/${roomCode}`);

    // Store host information in localStorage before redirecting
    if (user) {
      localStorage.setItem(`room_${roomCode}_host`, user.name);
      localStorage.setItem(`room_${roomCode}_user`, user.name);
    }

    // Redirect to the new room
    router.push(`/room/${roomCode}`);
  };

  if (user) {
    return (
      <DrawingRoom
        user={user}
        onBack={handleLogout}
        onRoomCreated={handleRoomCreated}
      />
    );
  }

  return <AuthScreen onLogin={handleLogin} />;
}
