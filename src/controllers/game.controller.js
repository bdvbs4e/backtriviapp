const gameService = require("../services/game.service");

exports.getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las partidas" });
  }
};


exports.getStats = async (req, res) => {
  try {
    const stats = await gameService.getStats();
    res.json(stats);
  } catch (err) {
    console.error("Error en getStats:", err);
    res.status(500).json({ error: "Error al obtener estadísticas globales" });
  }
};

exports.createGame = async (req, res) => {
  try {
    const { roomId } = req.body;
    const newGame = await gameService.createGame(roomId);
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updated = await gameService.updateGame(roomId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    await gameService.deleteGame(roomId);
    res.json({ message: "Partida eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
