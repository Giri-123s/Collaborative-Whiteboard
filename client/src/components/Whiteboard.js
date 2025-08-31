import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
import './Whiteboard.css';

const Whiteboard = ({ roomId, roomData, onLeaveRoom }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [drawingSettings, setDrawingSettings] = useState({
    color: '#000000',
    width: 2
  });
  const [otherUsers, setOtherUsers] = useState(new Map());
  const [drawingData, setDrawingData] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room-joined', (data) => {
      setUserCount(data.userCount);
      setDrawingData(data.drawingData || []);
    });

    newSocket.on('user-joined', (data) => {
      setUserCount(data.userCount);
      setOtherUsers(prev => {
        const newUsers = new Map(prev);
        newUsers.set(data.userId, {
          x: 0,
          y: 0,
          color: data.color
        });
        return newUsers;
      });
    });

    newSocket.on('user-left', (data) => {
      setUserCount(data.userCount);
      setOtherUsers(prev => {
        const newUsers = new Map(prev);
        newUsers.delete(data.userId);
        return newUsers;
      });
    });

    newSocket.on('cursor-move', (data) => {
      setOtherUsers(prev => {
        const newUsers = new Map(prev);
        newUsers.set(data.userId, {
          x: data.x,
          y: data.y,
          color: data.color
        });
        return newUsers;
      });
    });

    newSocket.on('draw-start', (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawStart(data);
      }
    });

    newSocket.on('draw-move', (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawMove(data);
      }
    });

    newSocket.on('draw-end', (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawEnd(data);
      }
    });

    newSocket.on('clear-canvas', () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    });

    newSocket.on('error', (data) => {
      console.error('Socket error:', data);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave-room');
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  const handleDrawingStart = (data) => {
    if (socket && isConnected) {
      socket.emit('draw-start', data);
    }
  };

  const handleDrawingMove = (data) => {
    if (socket && isConnected) {
      socket.emit('draw-move', data);
    }
  };

  const handleDrawingEnd = (data) => {
    if (socket && isConnected) {
      socket.emit('draw-end', data);
    }
  };

  const handleCursorMove = (x, y) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', { x, y });
    }
  };

  const handleClearCanvas = () => {
    if (socket && isConnected) {
      socket.emit('clear-canvas');
    }
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleSettingsChange = (settings) => {
    setDrawingSettings(prev => ({ ...prev, ...settings }));
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
      socket.disconnect();
    }
    onLeaveRoom();
  };

  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '●' : '○'}
            </span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="user-count">
            {userCount} user{userCount !== 1 ? 's' : ''} online
          </div>
        </div>
        <button onClick={handleLeaveRoom} className="leave-btn">
          Leave Room
        </button>
      </div>

      <div className="whiteboard-content">
        <Toolbar
          settings={drawingSettings}
          onSettingsChange={handleSettingsChange}
          onClearCanvas={handleClearCanvas}
        />
        
        <div className="canvas-container">
          <DrawingCanvas
            ref={canvasRef}
            settings={drawingSettings}
            drawingData={drawingData}
            onDrawingStart={handleDrawingStart}
            onDrawingMove={handleDrawingMove}
            onDrawingEnd={handleDrawingEnd}
            onCursorMove={handleCursorMove}
          />
          <UserCursors users={otherUsers} />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
