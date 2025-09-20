const playerResultService = require("../services/playerResult.service");

// Obtener resultados de una sala
exports.getPlayerResultsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const results = await playerResultService.getPlayerResultsByRoom(roomId);
    res.json(results);
  } catch (error) {
    console.error("Error obteniendo resultados de sala:", error);
    res.status(500).json({ error: "Error obteniendo resultados de sala" });
  }
};

// Crear o actualizar resultado de jugador
exports.createOrUpdatePlayerResult = async (req, res) => {
  try {
    const { roomId } = req.params;
    const playerData = req.body;
    const result = await playerResultService.createOrUpdatePlayerResult(roomId, playerData);
    res.json(result);
  } catch (error) {
    console.error("Error creando/actualizando resultado de jugador:", error);
    res.status(500).json({ error: "Error creando/actualizando resultado de jugador" });
  }
};

// Actualizar eliminación de jugador
exports.updatePlayerElimination = async (req, res) => {
  try {
    const { roomId, playerId } = req.params;
    const { eliminated, eliminatedRound } = req.body;
    const result = await playerResultService.updatePlayerElimination(roomId, playerId, eliminated, eliminatedRound);
    res.json(result);
  } catch (error) {
    console.error("Error actualizando eliminación de jugador:", error);
    res.status(500).json({ error: "Error actualizando eliminación de jugador" });
  }
};

// Actualizar puntuación de jugador
exports.updatePlayerScore = async (req, res) => {
  try {
    const { roomId, playerId } = req.params;
    const { score } = req.body;
    const result = await playerResultService.updatePlayerScore(roomId, playerId, score);
    res.json(result);
  } catch (error) {
    console.error("Error actualizando puntuación de jugador:", error);
    res.status(500).json({ error: "Error actualizando puntuación de jugador" });
  }
};

// Obtener estadísticas de un jugador
exports.getPlayerStats = async (req, res) => {
  try {
    const { playerId } = req.params;
    const stats = await playerResultService.getPlayerStats(playerId);
    res.json(stats);
  } catch (error) {
    console.error("Error obteniendo estadísticas de jugador:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas de jugador" });
  }
};

