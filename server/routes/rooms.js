const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Generate a random room code (6-8 alphanumeric characters)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/rooms/join - Join or create a room
router.post('/join', async (req, res) => {
  try {
    const { roomCode } = req.body;
    
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    // Check if room exists
    let room = await Room.findOne({ roomId: roomCode.toUpperCase() });
    
    if (!room) {
      // Create new room if it doesn't exist
      room = new Room({
        roomId: roomCode.toUpperCase(),
        drawingData: []
      });
      await room.save();
    }

    res.json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingData: room.drawingData
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rooms/:roomId - Get room information
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId: roomId.toUpperCase() });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingData: room.drawingData
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 