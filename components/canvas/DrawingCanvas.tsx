import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, util, Circle } from "fabric";
import { motion } from "framer-motion";

interface DrawingCanvasProps {
  tool: string;
  color: string;
  brushSize: number;
  onDrawingData?: (data: any) => void;
  onReceiveDrawingData?: any;
  partnerName?: string;
  userName?: string;
  isMobile?: boolean;
  onUndo?: () => void;
  onClearCanvas?: () => void;
  onExport?: () => void;
}

export const DrawingCanvas = ({
  tool,
  color,
  brushSize,
  onDrawingData,
  onReceiveDrawingData,
  partnerName,
  userName,
  isMobile = false,
  onUndo,
  onClearCanvas,
  onExport,
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 800,
    height: 600,
  });
  const [partnerCursor, setPartnerCursor] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Function to calculate responsive canvas dimensions
  const calculateCanvasDimensions = () => {
    if (!canvasContainerRef.current) return { width: 800, height: 600 };

    const container = canvasContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    if (isMobile) {
      // Mobile: Use full screen edge-to-edge, no header or toolbar padding
      const availableWidth = window.innerWidth; // Full width, no padding
      const availableHeight = window.innerHeight; // Full height, no padding

      // Use the full available space
      return {
        width: availableWidth,
        height: availableHeight,
      };
    } else {
      // Desktop logic (existing)
      const padding = 32;
      const maxWidth = Math.min(containerRect.width - padding, 1200);
      const maxHeight = Math.min(window.innerHeight - 200, 800);

      const aspectRatio = 4 / 3;
      let width = Math.max(320, maxWidth);
      let height = Math.max(240, maxHeight);

      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }

      return { width: Math.floor(width), height: Math.floor(height) };
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = calculateCanvasDimensions();
      setCanvasDimensions(newDimensions);

      if (fabricCanvas) {
        fabricCanvas.setDimensions(newDimensions);
        fabricCanvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fabricCanvas]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate initial dimensions
    const initialDimensions = calculateCanvasDimensions();
    setCanvasDimensions(initialDimensions);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: initialDimensions.width,
      height: initialDimensions.height,
      backgroundColor: "#ffffff",
    });

    // Initialize the drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = color;

    // Listen for drawing events
    canvas.on("path:created", (e) => {
      console.log("Path created:", e);
      if (onDrawingData) {
        const pathData = {
          type: "path:created",
          path: e.path?.toObject(),
          timestamp: Date.now(),
          user: userName,
        };
        onDrawingData(pathData);
      }
    });

    // TODO: Add cursor tracking later with proper throttling
    // For now, disable cursor tracking to prevent data spam

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update tool settings
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log(
      "Updating tool:",
      tool,
      "color:",
      color,
      "brushSize:",
      brushSize
    );

    // Set drawing mode based on tool
    if (tool === "pen" || tool === "brush") {
      fabricCanvas.isDrawingMode = true;

      // Ensure the brush exists
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      }

      // Restore original brush methods if they were overridden by eraser
      const brush = fabricCanvas.freeDrawingBrush;
      if ((brush as any)._originalRender) {
        (brush as any)._render = (brush as any)._originalRender;
        delete (brush as any)._originalRender;
      }
      if ((brush as any)._originalOnMouseDown) {
        brush.onMouseDown = (brush as any)._originalOnMouseDown;
        brush.onMouseMove = (brush as any)._originalOnMouseMove;
        brush.onMouseUp = (brush as any)._originalOnMouseUp;

        // Clear the stored methods
        delete (brush as any)._originalOnMouseDown;
        delete (brush as any)._originalOnMouseMove;
        delete (brush as any)._originalOnMouseUp;
      }

      // Remove eraser event listeners
      fabricCanvas.off("mouse:down", (fabricCanvas as any).eraserMouseDown);
      fabricCanvas.off("mouse:move", (fabricCanvas as any).eraserMouseMove);
      fabricCanvas.off("mouse:up", (fabricCanvas as any).eraserMouseUp);
      fabricCanvas.off("mouse:move", (fabricCanvas as any).eraserMouseTrack);
      fabricCanvas.off("mouse:out", (fabricCanvas as any).eraserMouseLeave);
      fabricCanvas.off("mouse:over", (fabricCanvas as any).eraserMouseEnter);

      // Reset cursor and selection
      fabricCanvas.hoverCursor = "crosshair";
      fabricCanvas.defaultCursor = "default";
      fabricCanvas.selection = true;

      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = color;
      console.log(
        "Drawing mode enabled with brush:",
        fabricCanvas.freeDrawingBrush
      );
    } else if (tool === "eraser") {
      // For eraser, disable drawing mode and enable object selection
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false; // Disable group selection
      fabricCanvas.hoverCursor = "crosshair";
      fabricCanvas.defaultCursor = "crosshair";

      // Remove any existing eraser event listeners
      fabricCanvas.off("mouse:down", (fabricCanvas as any).eraserMouseDown);
      fabricCanvas.off("mouse:move", (fabricCanvas as any).eraserMouseMove);
      fabricCanvas.off("mouse:up", (fabricCanvas as any).eraserMouseUp);
      fabricCanvas.off("mouse:move", (fabricCanvas as any).eraserMouseTrack);
      fabricCanvas.off("mouse:out", (fabricCanvas as any).eraserMouseLeave);
      fabricCanvas.off("mouse:over", (fabricCanvas as any).eraserMouseEnter);

      let isErasing = false;
      const eraserRadius = brushSize / 2;
      let eraserIndicator: any = null;

      // Create eraser radius indicator
      const createEraserIndicator = () => {
        if (eraserIndicator) {
          fabricCanvas.remove(eraserIndicator);
        }

        eraserIndicator = new Circle({
          radius: eraserRadius,
          fill: "transparent",
          stroke: "#ff0000",
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
          opacity: 0.7,
        });

        fabricCanvas.add(eraserIndicator);
        fabricCanvas.bringObjectToFront(eraserIndicator);
      };

      // Update eraser indicator position
      const updateEraserIndicator = (x: number, y: number) => {
        if (eraserIndicator) {
          eraserIndicator.set({
            left: x - eraserRadius,
            top: y - eraserRadius,
          });
          fabricCanvas.renderAll();
        }
      };

      // Eraser mouse down handler
      (fabricCanvas as any).eraserMouseDown = function (e: any) {
        isErasing = true;
        const pointer = fabricCanvas.getPointer(e.e);
        eraseAtPoint(pointer.x, pointer.y, eraserRadius);
      };

      // Eraser mouse move handler
      (fabricCanvas as any).eraserMouseMove = function (e: any) {
        const pointer = fabricCanvas.getPointer(e.e);
        updateEraserIndicator(pointer.x, pointer.y);

        if (!isErasing) return;
        eraseAtPoint(pointer.x, pointer.y, eraserRadius);
      };

      // Mouse move handler for showing eraser indicator when not erasing
      (fabricCanvas as any).eraserMouseTrack = function (e: any) {
        const pointer = fabricCanvas.getPointer(e.e);
        updateEraserIndicator(pointer.x, pointer.y);
      };

      // Eraser mouse up handler
      (fabricCanvas as any).eraserMouseUp = function (e: any) {
        isErasing = false;
      };

      // Mouse leave handler to hide eraser indicator
      (fabricCanvas as any).eraserMouseLeave = function (e: any) {
        if (eraserIndicator) {
          fabricCanvas.remove(eraserIndicator);
          eraserIndicator = null;
          fabricCanvas.renderAll();
        }
      };

      // Mouse enter handler to show eraser indicator
      (fabricCanvas as any).eraserMouseEnter = function (e: any) {
        createEraserIndicator();
      };

      // Function to erase objects at a point
      const eraseAtPoint = (x: number, y: number, radius: number) => {
        const objectsToRemove: any[] = [];

        fabricCanvas.getObjects().forEach((obj) => {
          const objBounds = obj.getBoundingRect();
          const eraserBounds = {
            left: x - radius,
            top: y - radius,
            width: radius * 2,
            height: radius * 2,
          };

          // Check if eraser area intersects with object bounds
          if (
            objBounds.left < eraserBounds.left + eraserBounds.width &&
            objBounds.left + objBounds.width > eraserBounds.left &&
            objBounds.top < eraserBounds.top + eraserBounds.height &&
            objBounds.top + objBounds.height > eraserBounds.top
          ) {
            objectsToRemove.push(obj);
          }
        });

        objectsToRemove.forEach((obj) => {
          fabricCanvas.remove(obj);
        });

        if (objectsToRemove.length > 0) {
          fabricCanvas.renderAll();

          // Send erase data to partner
          if (onDrawingData) {
            onDrawingData({
              type: "eraser:erase",
              x: x,
              y: y,
              radius: radius,
              timestamp: Date.now(),
              user: userName,
            });
          }
        }
      };

      // Add event listeners
      fabricCanvas.on("mouse:down", (fabricCanvas as any).eraserMouseDown);
      fabricCanvas.on("mouse:move", (fabricCanvas as any).eraserMouseMove);
      fabricCanvas.on("mouse:up", (fabricCanvas as any).eraserMouseUp);
      fabricCanvas.on("mouse:over", (fabricCanvas as any).eraserMouseEnter);
      fabricCanvas.on("mouse:out", (fabricCanvas as any).eraserMouseLeave);

      console.log("Eraser mode enabled - object removal");
    } else {
      fabricCanvas.isDrawingMode = false;

      // Clean up eraser indicator when switching away from eraser
      const currentEraserIndicator = fabricCanvas
        .getObjects()
        .find((obj: any) => obj.excludeFromExport === true);
      if (currentEraserIndicator) {
        fabricCanvas.remove(currentEraserIndicator);
        fabricCanvas.renderAll();
      }

      console.log("Drawing mode disabled");
    }

    // Force canvas to re-render
    fabricCanvas.renderAll();
  }, [tool, color, brushSize, fabricCanvas]);

  // Handle received drawing data from partner
  useEffect(() => {
    if (
      !fabricCanvas ||
      !onReceiveDrawingData ||
      !onReceiveDrawingData.user ||
      onReceiveDrawingData.user === userName
    )
      return;

    console.log("Applying partner drawing data:", onReceiveDrawingData);

    if (
      onReceiveDrawingData.type === "path:created" &&
      onReceiveDrawingData.path
    ) {
      // Create path from partner's drawing data and add it to the canvas
      try {
        // Create a temporary canvas to deserialize the path object
        const tempCanvas = document.createElement("canvas");
        const tempFabricCanvas = new FabricCanvas(tempCanvas);

        tempFabricCanvas
          .loadFromJSON({
            objects: [onReceiveDrawingData.path],
          })
          .then(() => {
            const objects = tempFabricCanvas.getObjects();
            if (objects.length > 0) {
              const pathObject = objects[0];
              pathObject.set({
                selectable: false,
                evented: false,
              });
              fabricCanvas.add(pathObject);
              fabricCanvas.renderAll();
            }
            tempFabricCanvas.dispose();
          });
      } catch (error) {
        console.error("Error creating path from partner data:", error);
      }
    } else if (onReceiveDrawingData.type === "cursor:move") {
      // Update partner cursor position
      setPartnerCursor({
        x: onReceiveDrawingData.x,
        y: onReceiveDrawingData.y,
      });
    } else if (onReceiveDrawingData.type === "canvas:clear") {
      // Clear canvas when partner clears
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";
      fabricCanvas.renderAll();
    } else if (onReceiveDrawingData.type === "canvas:undo") {
      // Undo last action when partner undos
      const objects = fabricCanvas.getObjects();
      if (objects.length > 0) {
        fabricCanvas.remove(objects[objects.length - 1]);
        fabricCanvas.renderAll();
      }
    } else if (onReceiveDrawingData.type === "eraser:erase") {
      // Handle eraser data from partner
      const { x, y, radius } = onReceiveDrawingData;
      const objectsToRemove: any[] = [];

      fabricCanvas.getObjects().forEach((obj) => {
        const objBounds = obj.getBoundingRect();
        const eraserBounds = {
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
        };

        // Check if eraser area intersects with object bounds
        if (
          objBounds.left < eraserBounds.left + eraserBounds.width &&
          objBounds.left + objBounds.width > eraserBounds.left &&
          objBounds.top < eraserBounds.top + eraserBounds.height &&
          objBounds.top + objBounds.height > eraserBounds.top
        ) {
          objectsToRemove.push(obj);
        }
      });

      objectsToRemove.forEach((obj) => {
        fabricCanvas.remove(obj);
      });

      if (objectsToRemove.length > 0) {
        fabricCanvas.renderAll();
      }
    }
  }, [onReceiveDrawingData, fabricCanvas, userName]);

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();

    if (onDrawingData) {
      onDrawingData({
        type: "canvas:clear",
        timestamp: Date.now(),
        user: userName,
      });
    }

    // Call parent callback if provided
    onClearCanvas?.();
  };

  const undo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();

      if (onDrawingData) {
        onDrawingData({
          type: "canvas:undo",
          timestamp: Date.now(),
          user: userName,
        });
      }
    }

    // Call parent callback if provided
    onUndo?.();
  };

  const exportCanvas = () => {
    if (!fabricCanvas) return;

    try {
      // Get canvas data as image
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 2, // Higher resolution
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `heartcanvas-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.href = dataURL;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Expose export function to parent component
  useEffect(() => {
    if (fabricCanvas) {
      // Store the export function reference for parent access
      (window as any).exportCanvas = exportCanvas;
    }
  }, [fabricCanvas]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={canvasContainerRef}
        className="w-full h-full flex items-center justify-center">
        <motion.div
          className={`${
            isMobile
              ? "w-full h-full"
              : "border-2 border-border rounded-2xl overflow-hidden shadow-love"
          } bg-white max-w-full`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}>
          <canvas
            ref={canvasRef}
            className="cursor-heart block w-full h-full"
            style={{
              display: "block",
              width: canvasDimensions.width,
              height: canvasDimensions.height,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />

          {/* Partner cursor indicator */}
          {partnerCursor && partnerName && (
            <motion.div
              className="absolute pointer-events-none z-10"
              style={{
                left: partnerCursor.x - 10,
                top: partnerCursor.y - 10,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}>
              <div className="relative">
                <div className="w-5 h-5 bg-accent rounded-full border-2 border-white shadow-md"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-nunito whitespace-nowrap">
                  {partnerName} ❤️
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
