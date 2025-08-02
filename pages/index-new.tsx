import { useState } from "react";
import { LoadingHearts } from "../components/shared/LoadingHearts";
import { DrawingRoom } from "./drawing-room";
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
  role: "user1" | "user2";
  roomCode: string;
}

const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      const finalRoomCode = isCreating
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : roomCode;
      onLogin({
        name: userName.trim(),
        role: "user1",
        roomCode: finalRoomCode,
      });
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              {isCreating ? "Create & Start Drawing" : "Join Room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return <DrawingRoom user={user} onBack={handleLogout} />;
  }

  return <AuthScreen onLogin={handleLogin} />;
}
