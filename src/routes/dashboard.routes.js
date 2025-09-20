// src/routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const gameStatsService = require("../services/gameStats.service");

// 📊 Estadísticas del dashboard
router.get("/stats", async (req, res) => {
  try {
    console.log("📊 Solicitando estadísticas del dashboard...");
    const stats = await gameStatsService.getDashboardStats();
    console.log("📈 Estadísticas obtenidas:", stats);
    res.json(stats);
  } catch (err) {
    console.error("Error en /dashboard/stats:", err);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

module.exports = router;
