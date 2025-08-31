const mongoose = require('mongoose');

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['stroke', 'clear'],
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema]
});

// Update lastActivity on save
roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Room', roomSchema); 