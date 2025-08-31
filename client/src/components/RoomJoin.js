import React, { useState } from 'react';
import './RoomJoin.css';

const RoomJoin = ({ onRoomJoin }) => {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode: roomCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      onRoomJoin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(result);
  };

  return (
    <div className="room-join">
      <div className="room-join-container">
        <h1>Collaborative Whiteboard</h1>
        <p>Enter a room code to start drawing together</p>
        
        <form onSubmit={handleSubmit} className="room-form">
          <div className="input-group">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code (6-8 characters)"
              maxLength={8}
              className="room-input"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={generateRandomCode}
              className="generate-btn"
              disabled={isLoading}
            >
              Generate
            </button>
          </div>
          
          <button
            type="submit"
            className="join-btn"
            disabled={isLoading || !roomCode.trim()}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        
        <div className="instructions">
          <h3>How it works:</h3>
          <ul>
            <li>Enter a 6-8 character room code</li>
            <li>If the room doesn't exist, it will be created</li>
            <li>Share the room code with others to collaborate</li>
            <li>Draw together in real-time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;
