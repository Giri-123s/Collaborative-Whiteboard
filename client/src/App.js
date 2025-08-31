import React, { useState } from 'react';
import './App.css';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);

  const handleRoomJoin = (roomInfo) => {
    setCurrentRoom(roomInfo.roomId);
    setRoomData(roomInfo);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setRoomData(null);
  };

  return (
    <div className="App">
      {!currentRoom ? (
        <RoomJoin onRoomJoin={handleRoomJoin} />
      ) : (
        <Whiteboard 
          roomId={currentRoom}
          roomData={roomData}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
