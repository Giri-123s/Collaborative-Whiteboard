# Collaborative Whiteboard Application

A real-time collaborative whiteboard application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for live collaboration.

## Features

- **Real-time Drawing**: Smooth drawing with pencil tool
- **Live Collaboration**: Multiple users can draw simultaneously
- **Cursor Tracking**: See other users' cursor positions in real-time
- **Room Management**: Join rooms with simple alphanumeric codes
- **Drawing Tools**: Color selection, stroke width adjustment, clear canvas
- **Responsive Design**: Works on desktop and tablet devices
- **Data Persistence**: Drawing data is saved to MongoDB

## Technology Stack

### Frontend
- **React.js**: UI framework
- **Socket.io-client**: Real-time communication
- **HTML5 Canvas**: Drawing functionality
- **CSS3**: Styling and responsive design

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB

## Project Structure

```
workelate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoomJoin.js          # Room code input
│   │   │   ├── Whiteboard.js        # Main whiteboard component
│   │   │   ├── DrawingCanvas.js     # Canvas drawing logic
│   │   │   ├── Toolbar.js           # Drawing controls
│   │   │   └── UserCursors.js       # Other users' cursors
│   │   ├── App.js
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/
│   │   └── Room.js         # MongoDB schema
│   ├── routes/
│   │   └── rooms.js        # API endpoints
│   ├── socket/
│   │   └── socketHandler.js # Socket.io event handlers
│   ├── server.js           # Main server file
│   └── package.json
├── README.md
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workelate
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/whiteboard
   PORT=5000
   NODE_ENV=development
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or update the MONGODB_URI in the .env file to point to your MongoDB instance.

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   # or for development with nodemon
   npm run dev
   ```

2. **Start the frontend application**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Documentation

### REST Endpoints

#### POST /api/rooms/join
Join or create a room by room code.

**Request Body:**
```json
{
  "roomCode": "ABC123"
}
```

**Response:**
```json
{
  "roomId": "ABC123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastActivity": "2024-01-01T00:00:00.000Z",
  "drawingData": []
}
```

#### GET /api/rooms/:roomId
Get room information and drawing data.

**Response:**
```json
{
  "roomId": "ABC123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastActivity": "2024-01-01T00:00:00.000Z",
  "drawingData": [
    {
      "type": "stroke",
      "data": {
        "path": [{"x": 100, "y": 100}, {"x": 200, "y": 200}],
        "color": "#000000",
        "width": 2
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Socket.io Events

#### Client to Server Events

- **join-room** (roomId): Join a room
- **leave-room**: Leave the current room
- **cursor-move** (data): Update cursor position
  ```json
  {
    "x": 100,
    "y": 200
  }
  ```
- **draw-start** (data): Start drawing stroke
  ```json
  {
    "x": 100,
    "y": 200,
    "color": "#000000",
    "width": 2
  }
  ```
- **draw-move** (data): Continue drawing stroke
  ```json
  {
    "x": 150,
    "y": 250
  }
  ```
- **draw-end** (data): End drawing stroke
  ```json
  {
    "path": [{"x": 100, "y": 100}, {"x": 200, "y": 200}],
    "color": "#000000",
    "width": 2
  }
  ```
- **clear-canvas**: Clear the entire canvas

#### Server to Client Events

- **room-joined** (data): Confirmation of room join
  ```json
  {
    "roomId": "ABC123",
    "drawingData": [],
    "userCount": 1
  }
  ```
- **user-joined** (data): New user joined the room
  ```json
  {
    "userCount": 2,
    "userId": "socket-id",
    "color": "#FF6B6B"
  }
  ```
- **user-left** (data): User left the room
  ```json
  {
    "userId": "socket-id",
    "userCount": 1
  }
  ```
- **cursor-move** (data): Other user's cursor position
  ```json
  {
    "userId": "socket-id",
    "x": 100,
    "y": 200,
    "color": "#FF6B6B"
  }
  ```
- **draw-start** (data): Other user started drawing
- **draw-move** (data): Other user's drawing movement
- **draw-end** (data): Other user finished drawing
- **clear-canvas** (data): Canvas was cleared by another user

## Database Schema

### Room Schema
```javascript
{
  roomId: String (unique, required),
  createdAt: Date (default: now),
  lastActivity: Date (default: now),
  drawingData: [DrawingCommandSchema]
}
```

### Drawing Command Schema
```javascript
{
  type: String (enum: ['stroke', 'clear'], required),
  data: Object (contains path, color, width, etc.),
  timestamp: Date (default: now)
}
```

## Architecture Overview

### System Design
1. **Frontend**: React application with Socket.io client
2. **Backend**: Express.js server with Socket.io
3. **Database**: MongoDB with Mongoose ODM
4. **Real-time Communication**: Socket.io for bidirectional communication

### Data Flow
1. User enters room code → API call to join room
2. Socket connection established → Join room socket event
3. Drawing actions → Socket events → Broadcast to all users
4. Cursor movements → Throttled socket events → Real-time cursor display
5. Drawing data → Saved to MongoDB for persistence

### Performance Optimizations
- **Cursor Throttling**: Cursor position updates throttled to ~60fps
- **Drawing Compression**: Efficient path data structures
- **Room Cleanup**: Automatic deletion of inactive rooms (24+ hours)
- **Canvas Optimization**: Smooth rendering with HTML5 Canvas

## Deployment Guide

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   PORT=5000
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy Backend**
   ```bash
   cd server
   npm install --production
   npm start
   ```

4. **Serve Frontend**
   - Copy the `client/build` folder to your web server
   - Configure your web server to serve the React app
   - Update the Socket.io connection URL in the frontend

### Docker Deployment

1. **Create Dockerfile for Backend**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend**
   ```dockerfile
   FROM node:16-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./server
       ports:
         - "5000:5000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/whiteboard
       depends_on:
         - mongo
     
     frontend:
       build: ./client
       ports:
         - "80:80"
       depends_on:
         - backend
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db

   volumes:
     mongo_data:
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the repository.
