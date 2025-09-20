// src/models/game.model.js
const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 🔥 Para mantener compatibilidad con sockets
  name: { type: String, required: true },
  ready: { type: Boolean, default: false },
  connected: { type: Boolean, default: true },
  socketId: { type: String },
  eliminated: { type: Boolean, default: false },
  round: { type: Number, default: null },
  score: { type: Number, default: 0 },
});

const GameSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["waiting", "started", "finished"], default: "waiting" },
  players: {
    type: [PlayerSchema],
    validate: [arrayLimit, "{PATH} excede el número máximo de jugadores (5)."],
  },
  questionsLog: { type: Array, default: [] }, // 🔥 Guardar preguntas enviadas
  currentQuestionIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  finishedAt: Date,
});

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("Game", GameSchema);
