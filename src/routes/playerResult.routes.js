const express = require("express");
const router = express.Router();
const playerResultController = require("../controllers/playerResult.controller");

// Obtener resultados de una sala
router.get("/room/:roomId", playerResultController.getPlayerResultsByRoom);

// Crear o actualizar resultado de jugador
router.post("/room/:roomId", playerResultController.createOrUpdatePlayerResult);

// Actualizar eliminación de jugador
router.put("/room/:roomId/player/:playerId/elimination", playerResultController.updatePlayerElimination);

// Actualizar puntuación de jugador
router.put("/room/:roomId/player/:playerId/score", playerResultController.updatePlayerScore);

// Obtener estadísticas de un jugador
router.get("/player/:playerId/stats", playerResultController.getPlayerStats);

module.exports = router;

