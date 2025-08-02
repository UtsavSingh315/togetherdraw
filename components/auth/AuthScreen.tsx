import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Sparkles, Link } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import heroImage from "../../assets/hero-couple-drawing.jpg";

interface AuthScreenProps {
  onLogin: (userData: {
    name: string;
    role: "user1" | "user2";
    roomCode: string;
  }) => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    const newRoomCode = generateRoomCode();
    onLogin({ name: name.trim(), role: "user1", roomCode: newRoomCode });
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !roomCode.trim()) return;
    onLogin({
      name: name.trim(),
      role: "user2",
      roomCode: roomCode.trim().toUpperCase(),
    });
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 gradient-soft opacity-80" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div
            className="heart-pulse inline-block mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>
            <Heart
              className="w-16 h-16 text-primary mx-auto"
              fill="currentColor"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-2 font-nunito">
            HeartCanvas
          </h1>
          <p className="text-muted-foreground font-nunito">
            Draw together, create memories
          </p>
        </div>

        <Card className="shadow-love border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="font-nunito">
              Join Your Drawing Session
            </CardTitle>
            <CardDescription className="font-nunito">
              Create a new canvas or join your partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-nunito"
              />
            </div>

            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="font-nunito">
                  Create Room
                </TabsTrigger>
                <TabsTrigger value="join" className="font-nunito">
                  Join Room
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground font-nunito">
                    Start a new drawing session and share the code with your
                    partner
                  </p>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!name.trim()}
                    className="w-full gradient-love text-white font-nunito font-semibold">
                    Create Drawing Room
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <Link className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground font-nunito mt-2">
                      Enter the room code shared by your partner
                    </p>
                  </div>
                  <Input
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="font-nunito"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!name.trim() || !roomCode.trim()}
                    className="w-full gradient-love text-white font-nunito font-semibold">
                    Join Drawing Room
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}>
          <p className="text-xs text-muted-foreground font-nunito">
            ✨ Draw together in real-time • Share memories • Create art ✨
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
