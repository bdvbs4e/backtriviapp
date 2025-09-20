const PlayerResult = require("../models/playerResult.model");

// Crear o actualizar resultado de jugador
exports.createOrUpdatePlayerResult = async (roomId, playerData) => {
  try {
    const { id: playerId, name: playerName, score = 0, eliminated = false, eliminatedRound = null, connected = true, ready = false, gameStatus = "waiting" } = playerData;
    
    const result = await PlayerResult.findOneAndUpdate(
      { roomId, playerId },
      {
        roomId,
        playerId,
        playerName,
        score,
        eliminated,
        eliminatedRound,
        connected,
        ready,
        gameStatus
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    return result;
  } catch (error) {
    console.error("Error creando/actualizando resultado de jugador:", error);
    throw error;
  }
};

// Obtener todos los resultados de una sala
exports.getPlayerResultsByRoom = async (roomId) => {
  try {
    const results = await PlayerResult.find({ roomId }).sort({ score: -1, eliminatedRound: 1 });
    return results;
  } catch (error) {
    console.error("Error obteniendo resultados de sala:", error);
    throw error;
  }
};

// Actualizar estado de eliminación de un jugador
exports.updatePlayerElimination = async (roomId, playerId, eliminated, eliminatedRound) => {
  try {
    const result = await PlayerResult.findOneAndUpdate(
      { roomId, playerId },
      { 
        eliminated, 
        eliminatedRound,
        gameStatus: eliminated ? "finished" : "started"
      },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Error actualizando eliminación de jugador:", error);
    throw error;
  }
};

// Actualizar puntuación de un jugador
exports.updatePlayerScore = async (roomId, playerId, score) => {
  try {
    const result = await PlayerResult.findOneAndUpdate(
      { roomId, playerId },
      { score },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Error actualizando puntuación de jugador:", error);
    throw error;
  }
};

// Actualizar estado de conexión de un jugador
exports.updatePlayerConnection = async (roomId, playerId, connected) => {
  try {
    const result = await PlayerResult.findOneAndUpdate(
      { roomId, playerId },
      { connected },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Error actualizando conexión de jugador:", error);
    throw error;
  }
};

// Marcar jugador como listo
exports.updatePlayerReady = async (roomId, playerId, ready) => {
  try {
    const result = await PlayerResult.findOneAndUpdate(
      { roomId, playerId },
      { ready },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Error actualizando estado de listo:", error);
    throw error;
  }
};

// Actualizar estado del juego para toda la sala
exports.updateGameStatus = async (roomId, gameStatus) => {
  try {
    const result = await PlayerResult.updateMany(
      { roomId },
      { gameStatus }
    );
    return result;
  } catch (error) {
    console.error("Error actualizando estado del juego:", error);
    throw error;
  }
};

// Eliminar todos los resultados de una sala
exports.deletePlayerResultsByRoom = async (roomId) => {
  try {
    const result = await PlayerResult.deleteMany({ roomId });
    return result;
  } catch (error) {
    console.error("Error eliminando resultados de sala:", error);
    throw error;
  }
};

// Obtener estadísticas de un jugador
exports.getPlayerStats = async (playerId) => {
  try {
    const stats = await PlayerResult.aggregate([
      { $match: { playerId } },
      {
        $group: {
          _id: "$playerId",
          totalGames: { $sum: 1 },
          totalWins: { $sum: { $cond: [{ $eq: ["$eliminated", false] }, 1, 0] } },
          totalScore: { $sum: "$score" },
          averageScore: { $avg: "$score" }
        }
      }
    ]);
    return stats[0] || null;
  } catch (error) {
    console.error("Error obteniendo estadísticas de jugador:", error);
    throw error;
  }
};

