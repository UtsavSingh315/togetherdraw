import { useState } from "react";
import { motion } from "framer-motion";
import {
  Pen,
  Brush,
  Eraser,
  Palette,
  Minus,
  Plus,
  Type,
  Smile,
  Circle,
  Square,
  Triangle,
  Undo,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DrawingToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onAddEmoji?: (emoji: string) => void;
  onUndo?: () => void;
  onClearCanvas?: () => void;
  isMobile?: boolean;
}

const colors = [
  "#FF6B9D",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8E8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#000000",
  "#FFFFFF",
  "#FF5722",
  "#8BC34A",
  "#E91E63",
];

const emojis = [
  "❤️",
  "💕",
  "💖",
  "🥰",
  "😍",
  "😘",
  "🌟",
  "✨",
  "🎨",
  "🐢",
  "🦋",
  "🌸",
  "🌺",
  "🎀",
  "💫",
];

const tools = [
  { id: "pen", icon: Pen, label: "Pen" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "square", icon: Square, label: "Rectangle" },
];

export const DrawingToolbar = ({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onAddEmoji,
  onUndo,
  onClearCanvas,
  isMobile = false,
}: DrawingToolbarProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Mobile Horizontal Layout */}
        <div className="flex items-center justify-between space-x-2">
          {/* Tools */}
          <div className="flex space-x-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToolChange(tool.id)}
                  className={`w-8 h-8 p-0 ${
                    selectedTool === tool.id
                      ? "gradient-love text-white"
                      : "hover:bg-secondary"
                  }`}
                  title={tool.label}>
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          {/* Color Picker */}
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-2"
                style={{ backgroundColor: selectedColor }}>
                <Palette
                  className="w-4 h-4"
                  style={{
                    color: selectedColor === "#FFFFFF" ? "#000" : "#fff",
                  }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" side="top">
              <div className="space-y-4">
                {/* Color Grid */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Colors</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedColor === color
                            ? "border-primary ring-2 ring-primary/50"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onColorChange(color);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush Size */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Brush Size: {brushSize}px
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        onBrushSizeChange(Math.max(1, brushSize - 2))
                      }>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="flex-1">
                      <Slider
                        value={[brushSize]}
                        onValueChange={(value) => onBrushSizeChange(value[0])}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        onBrushSizeChange(Math.min(50, brushSize + 2))
                      }>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Brush Preview */}
                  <div className="flex justify-center mt-2">
                    <div
                      className="rounded-full border border-border"
                      style={{
                        width: `${Math.max(4, Math.min(brushSize, 24))}px`,
                        height: `${Math.max(4, Math.min(brushSize, 24))}px`,
                        backgroundColor: selectedColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Emoji */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="w-10 h-10 text-xl hover:bg-secondary rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => {
                      onAddEmoji?.(emoji);
                      setShowEmojiPicker(false);
                    }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Action Buttons */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              className="w-8 h-8 p-0"
              title="Undo">
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCanvas}
              className="w-8 h-8 p-0 text-destructive"
              title="Clear All">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col space-y-3 sm:space-y-4">
      {/* Main Tools */}
      <Card className="p-3 sm:p-4 shadow-love">
        <div className="flex flex-wrap gap-2 justify-center">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => onToolChange(tool.id)}
                className={`w-10 h-10 sm:w-12 sm:h-12 ${
                  selectedTool === tool.id
                    ? "gradient-love text-white"
                    : "hover:bg-secondary"
                } font-nunito`}
                title={tool.label}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Color Palette */}
      <Card className="p-3 sm:p-4 shadow-love">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-nunito font-medium">
              Color & Brush
            </span>
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-7 h-7 sm:w-8 sm:h-8 p-0 border-2"
                  style={{ backgroundColor: selectedColor }}>
                  <Palette
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    style={{
                      color: selectedColor === "#FFFFFF" ? "#000" : "#fff",
                    }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  {/* Color Grid */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Colors</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color
                              ? "border-primary ring-2 ring-primary/50"
                              : "border-border"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            onColorChange(color);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Brush Size: {brushSize}px
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() =>
                          onBrushSizeChange(Math.max(1, brushSize - 2))
                        }>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[brushSize]}
                          onValueChange={(value) => onBrushSizeChange(value[0])}
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() =>
                          onBrushSizeChange(Math.min(50, brushSize + 2))
                        }>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {/* Brush Preview */}
                    <div className="flex justify-center mt-2">
                      <div
                        className="rounded-full border border-border"
                        style={{
                          width: `${Math.max(4, Math.min(brushSize, 24))}px`,
                          height: `${Math.max(4, Math.min(brushSize, 24))}px`,
                          backgroundColor: selectedColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
            {colors.slice(0, 8).map((color) => (
              <button
                key={color}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-border"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Emoji Stickers */}
      <Card className="p-3 sm:p-4 shadow-love">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-nunito font-medium">
              Stickers
            </span>
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 sm:h-8">
                  <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="w-10 h-10 text-xl hover:bg-secondary rounded-lg transition-colors flex items-center justify-center"
                      onClick={() => {
                        onAddEmoji?.(emoji);
                        setShowEmojiPicker(false);
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {emojis.slice(0, 10).map((emoji) => (
              <button
                key={emoji}
                className="w-6 h-6 sm:w-8 sm:h-8 text-sm sm:text-lg hover:bg-secondary rounded-lg transition-colors flex items-center justify-center"
                onClick={() => onAddEmoji?.(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-3 sm:p-4 shadow-love">
        <div className="space-y-3">
          <span className="text-xs sm:text-sm font-nunito font-medium">
            Actions
          </span>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              className="w-full justify-start font-nunito">
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCanvas}
              className="w-full justify-start font-nunito text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
