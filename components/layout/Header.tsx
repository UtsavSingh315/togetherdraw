import { motion } from "framer-motion";
import {
  Heart,
  Share,
  Download,
  Users,
  Wifi,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "../ui/use-toast";
import { useState } from "react";

interface HeaderProps {
  userName: string;
  partnerName?: string;
  roomCode: string;
  isConnected: boolean;
  onShare?: () => void;
  onExport?: () => void;
}

export const Header = ({
  userName,
  partnerName,
  roomCode,
  isConnected,
  onShare,
  onExport,
}: HeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = () => {
    // Call parent share function if provided, otherwise fallback to simple copy
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(roomCode);
      toast({
        title: "Room code copied! 💕",
        description:
          "Share this code with your partner to start drawing together",
      });
    }
    setShowMenu(false);
  };

  const handleExport = () => {
    onExport?.();
    setShowMenu(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/20 shadow-sm">
      <div className="container mx-auto px-4 py-2 lg:py-4">
        {/* Mobile Layout - Simple with 3-dots menu */}
        <div className="lg:hidden flex items-center justify-between">
          {/* User Name and Partner Info */}
          <div className="flex items-center space-x-2">
            <motion.div className="heart-pulse" whileHover={{ scale: 1.1 }}>
              <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground font-nunito leading-tight">
                {userName}
              </span>
              {partnerName && (
                <span className="text-xs text-muted-foreground font-nunito leading-tight">
                  Drawing with {partnerName}
                </span>
              )}
            </div>
          </div>

          {/* 3-Dots Menu */}
          <Popover open={showMenu} onOpenChange={setShowMenu}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="bottom" align="end">
              <div className="space-y-3">
                {/* Connection Status */}
                <div className="flex items-center space-x-2 px-2 py-1 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                    <Wifi
                      className={`w-4 h-4 ${
                        isConnected ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-nunito">
                    {isConnected ? "Connected" : "Offline"}
                  </span>
                </div>

                {/* Partner Info */}
                <div className="flex items-center space-x-2 px-2 py-1 bg-muted/50 rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-nunito">
                    {partnerName ? `Drawing with ${partnerName}` : "No partner"}
                  </span>
                </div>

                {/* Room Code */}
                <div className="px-2 py-1 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-nunito">
                      Room Code:
                    </span>
                    <code className="text-sm font-bold text-primary font-nunito">
                      {roomCode}
                    </code>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="w-full justify-start font-nunito">
                    <Share className="w-4 h-4 mr-2" />
                    Share Room Code
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="w-full justify-start font-nunito">
                    <Download className="w-4 h-4 mr-2" />
                    Export Drawing
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Desktop Layout - Full header */}
        <div className="hidden lg:flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            <motion.div className="heart-pulse" whileHover={{ scale: 1.1 }}>
              <Heart
                className="w-5 h-5 lg:w-8 lg:h-8 text-primary"
                fill="currentColor"
              />
            </motion.div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-foreground font-nunito">
                HeartCanvas
              </h1>
              <p className="hidden lg:block text-xs sm:text-sm text-muted-foreground font-nunito">
                Draw together, create memories
              </p>
            </div>
          </div>

          {/* Connection Status & Users */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <Card className="px-2 lg:px-3 py-1 lg:py-2 shadow-love">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                  <Wifi
                    className={`w-3 h-3 lg:w-4 lg:h-4 ${
                      isConnected ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Users className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
                  <span className="text-xs lg:text-sm font-nunito">
                    {userName} {partnerName && `& ${partnerName}`}
                  </span>
                </div>
              </div>
            </Card>

            {/* Room Code */}
            <Card className="px-2 lg:px-3 py-1 lg:py-2 shadow-love">
              <div className="flex items-center space-x-1 lg:space-x-2">
                <span className="text-xs lg:text-sm text-muted-foreground font-nunito">
                  Room:
                </span>
                <code className="text-xs lg:text-sm font-bold text-primary font-nunito">
                  {roomCode}
                </code>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="font-nunito text-xs lg:text-sm h-7 lg:h-8">
                <Share className="w-3 h-3 lg:w-4 lg:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share Code</span>
                <span className="sm:hidden">Share</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="font-nunito text-xs lg:text-sm h-7 lg:h-8">
                <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
