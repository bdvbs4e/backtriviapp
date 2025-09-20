const mongoose = require("mongoose");

const playerResultSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  playerId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  eliminated: {
    type: Boolean,
    default: false
  },
  eliminatedRound: {
    type: Number,
    default: null
  },
  connected: {
    type: Boolean,
    default: true
  },
  ready: {
    type: Boolean,
    default: false
  },
  gameStatus: {
    type: String,
    enum: ["waiting", "started", "finished"],
    default: "waiting"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas
playerResultSchema.index({ roomId: 1, playerId: 1 });
playerResultSchema.index({ roomId: 1, gameStatus: 1 });

// Middleware para actualizar updatedAt
playerResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("PlayerResult", playerResultSchema);

