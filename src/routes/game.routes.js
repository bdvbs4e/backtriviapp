// src/routes/game.routes.js
const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game.controller");

// ✅ Obtener todas las partidas
router.get("/", gameController.getAllGames);

// ✅ Obtener estadísticas globales
router.get("/stats", gameController.getStats);


// ✅ Obtener una partida específica por roomId
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const game = await require("../services/game.service").getGameByRoomId(roomId);
    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" });
    }
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la partida" });
  }
});

module.exports = router;
