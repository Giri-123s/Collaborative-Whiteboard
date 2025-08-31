const Room = require('../models/Room');

function socketHandler(io) {
  // Store active users per room
  const activeUsers = new Map(); // roomId -> Set of socketIds
  const userCursors = new Map(); // socketId -> {roomId, x, y, color}

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async (roomId) => {
      try {
        // Normalize room ID
        const normalizedRoomId = roomId.toUpperCase();
        
        // Join socket room
        socket.join(normalizedRoomId);
        
        // Add user to active users
        if (!activeUsers.has(normalizedRoomId)) {
          activeUsers.set(normalizedRoomId, new Set());
        }
        activeUsers.get(normalizedRoomId).add(socket.id);
        
        // Generate user color
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const userColor = colors[socket.id.length % colors.length];
        
        // Store user cursor info
        userCursors.set(socket.id, {
          roomId: normalizedRoomId,
          x: 0,
          y: 0,
          color: userColor
        });

        // Get room data from database
        let room = await Room.findOne({ roomId: normalizedRoomId });
        if (!room) {
          room = new Room({
            roomId: normalizedRoomId,
            drawingData: []
          });
          await room.save();
        }

        // Send room data to the joining user
        socket.emit('room-joined', {
          roomId: normalizedRoomId,
          drawingData: room.drawingData,
          userCount: activeUsers.get(normalizedRoomId).size
        });

        // Notify other users in the room
        socket.to(normalizedRoomId).emit('user-joined', {
          userCount: activeUsers.get(normalizedRoomId).size,
          userId: socket.id,
          color: userColor
        });

        console.log(`User ${socket.id} joined room ${normalizedRoomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      const { x, y } = data;
      const userInfo = userCursors.get(socket.id);
      
      if (userInfo) {
        userInfo.x = x;
        userInfo.y = y;
        
        // Broadcast cursor position to other users in the room
        socket.to(userInfo.roomId).emit('cursor-move', {
          userId: socket.id,
          x: x,
          y: y,
          color: userInfo.color
        });
      }
    });

    // Drawing events
    socket.on('draw-start', (data) => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        socket.to(userInfo.roomId).emit('draw-start', {
          userId: socket.id,
          color: userInfo.color,
          ...data
        });
      }
    });

    socket.on('draw-move', (data) => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        socket.to(userInfo.roomId).emit('draw-move', {
          userId: socket.id,
          color: userInfo.color,
          ...data
        });
      }
    });

    socket.on('draw-end', async (data) => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        // Broadcast to other users
        socket.to(userInfo.roomId).emit('draw-end', {
          userId: socket.id,
          color: userInfo.color,
          ...data
        });

        // Save drawing data to database
        try {
          const room = await Room.findOne({ roomId: userInfo.roomId });
          if (room) {
            room.drawingData.push({
              type: 'stroke',
              data: {
                path: data.path,
                color: userInfo.color,
                width: data.width,
                timestamp: new Date()
              },
              timestamp: new Date()
            });
            await room.save();
          }
        } catch (error) {
          console.error('Error saving drawing data:', error);
        }
      }
    });

    // Clear canvas
    socket.on('clear-canvas', async () => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        // Broadcast to other users
        socket.to(userInfo.roomId).emit('clear-canvas', {
          userId: socket.id
        });

        // Save clear command to database
        try {
          const room = await Room.findOne({ roomId: userInfo.roomId });
          if (room) {
            room.drawingData.push({
              type: 'clear',
              data: {
                timestamp: new Date()
              },
              timestamp: new Date()
            });
            await room.save();
          }
        } catch (error) {
          console.error('Error saving clear command:', error);
        }
      }
    });

    // Leave room
    socket.on('leave-room', () => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        const roomId = userInfo.roomId;
        socket.leave(roomId);
        
        // Remove from active users
        if (activeUsers.has(roomId)) {
          activeUsers.get(roomId).delete(socket.id);
          if (activeUsers.get(roomId).size === 0) {
            activeUsers.delete(roomId);
          }
        }
        
        // Notify other users
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          userCount: activeUsers.get(roomId)?.size || 0
        });
        
        userCursors.delete(socket.id);
        console.log(`User ${socket.id} left room ${roomId}`);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userInfo = userCursors.get(socket.id);
      if (userInfo) {
        const roomId = userInfo.roomId;
        
        // Remove from active users
        if (activeUsers.has(roomId)) {
          activeUsers.get(roomId).delete(socket.id);
          if (activeUsers.get(roomId).size === 0) {
            activeUsers.delete(roomId);
          }
        }
        
        // Notify other users
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          userCount: activeUsers.get(roomId)?.size || 0
        });
        
        userCursors.delete(socket.id);
        console.log(`User ${socket.id} disconnected from room ${roomId}`);
      }
    });
  });

  // Clean up old rooms (inactive for 24+ hours)
  setInterval(async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await Room.deleteMany({
        lastActivity: { $lt: twentyFourHoursAgo }
      });
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old rooms`);
      }
    } catch (error) {
      console.error('Error cleaning up old rooms:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}

module.exports = socketHandler; 