import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { LoadingHearts } from "../components/shared/LoadingHearts";
import { DrawingCanvas } from "../components/canvas/DrawingCanvas";
import { DrawingToolbar } from "../components/tools/DrawingToolbar";
import { Header } from "../components/layout/Header";
import { SocketManager } from "../components/connection/SocketManager";
import { toast } from "../components/ui/use-toast";

interface DrawingRoomProps {
  user?: {
    name: string;
    role: "host" | "guest" | "user1" | "user2";
    roomCode: string;
  };
  onBack?: () => void;
  onRoomCreated?: (roomCode: string) => void;
}

export const DrawingRoom = ({
  user,
  onBack,
  onRoomCreated,
}: DrawingRoomProps) => {
  // SSR-safe guard - if no user prop during build, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingHearts message="Loading..." />
        </div>
      </div>
    );
  }

  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#FF6B9D");
  const [brushSize, setBrushSize] = useState(3);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to skip loading
  const [receivedDrawingData, setReceivedDrawingData] = useState<any>(null);

  const [connectionMode, setConnectionMode] = useState<
    "connecting" | "online" | "local"
  >("connecting");

  // Handle SSR case where user might be undefined
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingHearts message="Loading..." />
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log("📊 DrawingRoom mounted with user:", user);
    console.log(
      "📊 Initial states - isLoading:",
      isLoading,
      "connectionMode:",
      connectionMode
    );

    // Start in local mode by default
    setConnectionMode("local");
  }, []); // Run only once on mount

  const handleConnectionChange = (connected: boolean) => {
    console.log("🔗 Connection changed:", connected);
    setIsConnected(connected);
    if (connected) {
      setConnectionMode("online");
      console.log("✅ Connected - setting mode to online");
    } else {
      setConnectionMode("connecting");
      console.log("❌ Disconnected - setting mode to connecting");
      toast({
        title: "Connection lost 📡",
        description: "Server not available - using local mode",
        variant: "default",
      });
    }
  };

  const handleUserJoined = (data: { name: string; count: number }) => {
    setPartnerName(data.name);
    toast({
      title: "Partner joined! 🎨",
      description: `${data.name} is now drawing with you`,
    });
  };

  const handleUserLeft = (data: { name: string; count: number }) => {
    setPartnerName(null);
    toast({
      title: "Partner left 👋",
      description: `${data.name} has left the room`,
    });
  };

  const handleDataReceived = (data: any) => {
    // Handle incoming drawing data from partner
    console.log("Received drawing data:", data);
    setReceivedDrawingData(data);
  };

  const handleRoomActive = () => {
    console.log("🎯 Room is now active in DrawingRoom");
    console.log(
      "📊 Current states before activation - isLoading:",
      isLoading,
      "connectionMode:",
      connectionMode
    );
    setConnectionMode("online");
    // Don't set isLoading to false since it's already false by default
    console.log("📊 States after activation - connectionMode: online");
  };

  const handleRoomCreatedSuccess = (roomCode: string) => {
    console.log("🏠 Room created successfully:", roomCode);
    if (onRoomCreated) {
      onRoomCreated(roomCode);
    }
  };

  const handleSendDrawingData = (data: any) => {
    // Send drawing data to partner via socket
    if ((SocketManager as any).sendDrawingData) {
      (SocketManager as any).sendDrawingData(data);
    }
  };

  const handleExport = () => {
    // Call the canvas export function
    if ((window as any).exportCanvas) {
      try {
        (window as any).exportCanvas();
        toast({
          title: "Canvas exported! 📸",
          description: "Your beautiful artwork has been saved as an image!",
        });
      } catch (error) {
        console.error("Export error:", error);
        toast({
          title: "Export failed 😔",
          description: "Failed to export canvas. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Export failed 😔",
        description: "Canvas not ready for export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    const shareText = `Join me on HeartCanvas! Room code: ${user.roomCode}`;
    const shareUrl = `${window.location.origin}/room/${user.roomCode}`;

    // Try to use native sharing if available
    if (navigator.share) {
      navigator
        .share({
          title: "HeartCanvas - Draw Together",
          text: shareText,
          url: shareUrl,
        })
        .then(() => {
          toast({
            title: "Shared successfully! 💕",
            description: "Room details shared with your partner",
          });
        })
        .catch((error) => {
          console.log("Native sharing failed:", error);
          fallbackShare();
        });
    } else {
      fallbackShare();
    }

    function fallbackShare() {
      // Fallback: copy to clipboard
      const fullShareText = `${shareText}\n${shareUrl}`;
      navigator.clipboard
        .writeText(fullShareText)
        .then(() => {
          toast({
            title: "Room details copied! 💕",
            description:
              "Share this with your partner to start drawing together",
          });
        })
        .catch((clipboardError) => {
          console.error("Clipboard failed:", clipboardError);
          // Final fallback: just copy room code
          try {
            navigator.clipboard.writeText(user.roomCode);
            toast({
              title: "Room code copied! 💕",
              description: `Room code ${user.roomCode} copied to clipboard`,
            });
          } catch (finalError) {
            console.error("All copy methods failed:", finalError);
            toast({
              title: "Share failed 😔",
              description:
                "Unable to copy room details. Please share manually.",
              variant: "destructive",
            });
          }
        });
    }
  };

  const handleAddEmoji = (emoji: string) => {
    toast({
      title: `Added ${emoji}`,
      description: "Emoji sticker added to canvas!",
    });
    // Simulate sending emoji data
    handleSendDrawingData({ type: "emoji", emoji, timestamp: Date.now() });
  };

  const handleUndo = () => {
    // Canvas undo logic is handled in the canvas component
    // This is just for any additional UI feedback if needed
    console.log("Undo action triggered");
  };

  const handleClearCanvas = () => {
    // Canvas clear logic is handled in the canvas component
    // This is just for any additional UI feedback if needed
    console.log("Clear canvas action triggered");
  };

  if (isLoading) {
    console.log(
      "🚨 WARNING: Still showing loading screen, isLoading:",
      isLoading
    );
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingHearts message={`Creating your drawing space...`} />
          <p className="mt-4 text-sm text-gray-600">
            Debug: isLoading = {isLoading.toString()}, connectionMode ={" "}
            {connectionMode}
          </p>
          <button
            onClick={() => setIsLoading(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            FORCE EXIT LOADING (Debug)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <SocketManager
        user={user}
        onDataReceived={handleDataReceived}
        onUserJoined={handleUserJoined}
        onUserLeft={handleUserLeft}
        onConnectionChange={handleConnectionChange}
        setPartnerName={setPartnerName}
        setIsLoading={() => {}} // Disable SocketManager from controlling loading
        onRoomActive={handleRoomActive}
        onRoomCreated={handleRoomCreatedSuccess}
      />

      <Header
        userName={user.name}
        partnerName={partnerName || undefined}
        roomCode={user.roomCode}
        isConnected={isConnected}
        onShare={handleShare}
        onExport={handleExport}
      />

      <div className="h-screen flex flex-col lg:block">
        {/* Desktop Layout */}
        <div className="hidden lg:block pt-20">
          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Drawing Tools Sidebar */}
              <motion.div
                className="lg:col-span-1 order-2 lg:order-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="lg:sticky lg:top-24">
                  <DrawingToolbar
                    selectedTool={selectedTool}
                    onToolChange={setSelectedTool}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    onAddEmoji={handleAddEmoji}
                    onUndo={handleUndo}
                    onClearCanvas={handleClearCanvas}
                  />
                </div>
              </motion.div>

              {/* Main Canvas Area */}
              <motion.div
                className="lg:col-span-3 order-1 lg:order-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="w-full">
                  <DrawingCanvas
                    tool={selectedTool}
                    color={selectedColor}
                    brushSize={brushSize}
                    onDrawingData={handleSendDrawingData}
                    onReceiveDrawingData={receivedDrawingData}
                    partnerName={partnerName || undefined}
                    userName={user.name}
                    onUndo={handleUndo}
                    onClearCanvas={handleClearCanvas}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-full">
          {/* Mobile Canvas Area - Full screen from top to bottom */}
          <div className="absolute inset-0">
            <DrawingCanvas
              tool={selectedTool}
              color={selectedColor}
              brushSize={brushSize}
              onDrawingData={handleSendDrawingData}
              onReceiveDrawingData={receivedDrawingData}
              partnerName={partnerName || undefined}
              userName={user.name}
              isMobile={true}
              onUndo={handleUndo}
              onClearCanvas={handleClearCanvas}
            />
          </div>

          {/* Floating Mobile Toolbar at Bottom */}
          <motion.div
            className="fixed bottom-4 left-4 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="bg-white/90 backdrop-blur-md border border-border/20 rounded-2xl shadow-lg p-2">
              <DrawingToolbar
                selectedTool={selectedTool}
                onToolChange={setSelectedTool}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                onAddEmoji={handleAddEmoji}
                onUndo={handleUndo}
                onClearCanvas={handleClearCanvas}
                isMobile={true}
              />
            </div>
          </motion.div>
        </div>

        {/* Connection Status Bar */}
        {connectionMode === "local" && (
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-2 rounded-full flex items-center space-x-2 text-sm sm:text-base">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="hidden sm:inline">
                Local Mode - No real-time sync
              </span>
              <span className="sm:hidden">Local Mode</span>
            </div>
          </motion.div>
        )}

        {connectionMode === "connecting" && (
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full flex items-center space-x-2 text-sm sm:text-base">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-current rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="hidden sm:inline">Connecting to server...</span>
              <span className="sm:hidden">Connecting...</span>
            </div>
          </motion.div>
        )}

        {/* Partner waiting indicator */}
        {isConnected && !partnerName && (
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="bg-green-100 text-green-800 px-3 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 max-w-xs sm:max-w-none text-sm sm:text-base">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-current rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="hidden sm:inline">
                Waiting for your partner to join... Share code:{" "}
                <strong>{user.roomCode}</strong>
              </span>
              <span className="sm:hidden text-center">
                Waiting for partner...
                <br />
                <strong>{user.roomCode}</strong>
              </span>
            </div>
          </motion.div>
        )}

        {/* Back button - commented out for mobile optimization */}
        {/* 
        <motion.div
          className="fixed top-4 left-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}>
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm border">
            ← Back to Home
          </button>
        </motion.div> 
        */}
      </div>
    </div>
  );
};

export default DrawingRoom;
