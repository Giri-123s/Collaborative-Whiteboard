import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = forwardRef(({ 
  settings, 
  drawingData, 
  onDrawingStart, 
  onDrawingMove, 
  onDrawingEnd, 
  onCursorMove 
}, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const remoteDrawingsRef = useRef(new Map());

  useImperativeHandle(ref, () => ({
    handleRemoteDrawStart: (data) => {
      const { userId, color, x, y, width } = data;
      remoteDrawingsRef.current.set(userId, {
        color,
        width,
        path: [{ x, y }],
        isDrawing: true
      });
      drawRemoteStroke(userId);
    },
    handleRemoteDrawMove: (data) => {
      const { userId, x, y } = data;
      const drawing = remoteDrawingsRef.current.get(userId);
      if (drawing && drawing.isDrawing) {
        drawing.path.push({ x, y });
        drawRemoteStroke(userId);
      }
    },
    handleRemoteDrawEnd: (data) => {
      const { userId } = data;
      const drawing = remoteDrawingsRef.current.get(userId);
      if (drawing) {
        drawing.isDrawing = false;
        remoteDrawingsRef.current.delete(userId);
      }
    },
    clearCanvas: () => {
      if (contextRef.current) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        remoteDrawingsRef.current.clear();
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (contextRef.current) {
        contextRef.current.lineCap = 'round';
        contextRef.current.lineJoin = 'round';
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const context = canvas.getContext('2d');
    contextRef.current = context;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    // Redraw saved drawing data when component mounts or data changes
    if (contextRef.current && drawingData.length > 0) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      drawingData.forEach(command => {
        if (command.type === 'stroke') {
          const { path, color, width } = command.data;
          if (path && path.length > 0) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = width;
            contextRef.current.beginPath();
            contextRef.current.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
              contextRef.current.lineTo(path[i].x, path[i].y);
            }
            contextRef.current.stroke();
          }
        }
      });
    }
  }, [drawingData]);

  const drawRemoteStroke = (userId) => {
    const drawing = remoteDrawingsRef.current.get(userId);
    if (!drawing || drawing.path.length < 2) return;

    const context = contextRef.current;
    if (!context) return;

    context.strokeStyle = drawing.color;
    context.lineWidth = drawing.width;
    context.beginPath();
    context.moveTo(drawing.path[drawing.path.length - 2].x, drawing.path[drawing.path.length - 2].y);
    context.lineTo(drawing.path[drawing.path.length - 1].x, drawing.path[drawing.path.length - 1].y);
    context.stroke();
  };

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    const coords = getCanvasCoordinates(event);
    isDrawingRef.current = true;
    lastPointRef.current = coords;
    
    const context = contextRef.current;
    context.strokeStyle = settings.color;
    context.lineWidth = settings.width;
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    
    onDrawingStart({
      x: coords.x,
      y: coords.y,
      color: settings.color,
      width: settings.width
    });
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;
    
    const coords = getCanvasCoordinates(event);
    const context = contextRef.current;
    
    context.lineTo(coords.x, coords.y);
    context.stroke();
    
    onDrawingMove({
      x: coords.x,
      y: coords.y
    });
    
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    
    onDrawingEnd({
      path: [lastPointRef.current],
      color: settings.color,
      width: settings.width
    });
  };

  const handleMouseMove = (event) => {
    const coords = getCanvasCoordinates(event);
    onCursorMove(coords.x, coords.y);
    
    if (isDrawingRef.current) {
      draw(event);
    }
  };

  const handleMouseDown = (event) => {
    startDrawing(event);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  const handleMouseLeave = () => {
    stopDrawing();
  };

  // Touch events for mobile support
  const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseDown(mouseEvent);
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseMove(mouseEvent);
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    handleMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
