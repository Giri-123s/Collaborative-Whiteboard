import React from 'react';
import './UserCursors.css';

const UserCursors = ({ users }) => {
  return (
    <div className="user-cursors">
      {Array.from(users.entries()).map(([userId, userData]) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: `${userData.x}px`,
            top: `${userData.y}px`,
            borderColor: userData.color
          }}
        >
          <div 
            className="cursor-dot"
            style={{ backgroundColor: userData.color }}
          />
          <div className="cursor-label">
            User {userId.slice(-4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCursors;
