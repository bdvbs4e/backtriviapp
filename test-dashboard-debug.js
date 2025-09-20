// Script de depuración para verificar las estadísticas del dashboard
require("dotenv").config();
const mongoose = require("mongoose");
const GameStats = require("./src/models/gameStats.model");
const gameStatsService = require("./src/services/gameStats.service");

async function testDashboardDebug() {
  try {
    console.log("🔍 Conectando a la base de datos...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/triviapp");
    console.log("✅ Conectado a MongoDB");

    console.log("\n📊 Verificando colección GameStats...");
    const allStats = await GameStats.find({});
    console.log(`📈 Documentos encontrados: ${allStats.length}`);
    
    if (allStats.length > 0) {
      const latestStats = allStats[0];
      console.log("\n📋 Último documento de estadísticas:");
      console.log(JSON.stringify(latestStats, null, 2));
    } else {
      console.log("⚠️  No hay documentos en la colección GameStats");
      console.log("🔄 Creando documento inicial...");
      const initialStats = await gameStatsService.getCurrentStats();
      console.log("✅ Documento inicial creado:", {
        totalGames: initialStats.totalGamesPlayed,
        totalPlayers: initialStats.totalPlayers,
        lastUpdated: initialStats.lastUpdated
      });
    }

    console.log("\n🔧 Probando servicio getDashboardStats...");
    const dashboardStats = await gameStatsService.getDashboardStats();
    console.log("📊 Estadísticas del dashboard:");
    console.log(JSON.stringify(dashboardStats, null, 2));

    console.log("\n🎮 Simulando partida terminada...");
    const mockGameData = {
      roomId: "test-room-debug-" + Date.now(),
      players: [
        { playerId: "player1", playerName: "Juan", score: 5, eliminated: false },
        { playerId: "player2", playerName: "María", score: 3, eliminated: true, eliminatedRound: 3 },
        { playerId: "player3", playerName: "Pedro", score: 2, eliminated: true, eliminatedRound: 2 }
      ],
      questions: [
        { category: "Historia", text: "¿En qué año...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
        { category: "Ciencia", text: "¿Qué es...?", options: ["A", "B", "C", "D"], correctAnswer: "B" },
        { category: "Matemáticas", text: "¿Cuánto es...?", options: ["A", "B", "C", "D"], correctAnswer: "C" }
      ],
      gameDuration: 300 // 5 minutos
    };
    
    console.log("📊 Datos de la partida simulada:");
    console.log("- Jugadores:", mockGameData.players.length);
    console.log("- Preguntas:", mockGameData.questions.length);
    console.log("- Duración:", mockGameData.gameDuration, "segundos");
    console.log("- Puntajes:", mockGameData.players.map(p => `${p.playerName}: ${p.score}`).join(", "));
    
    await gameStatsService.updateStatsAfterGame(mockGameData);
    console.log("✅ Estadísticas actualizadas después de la partida");
    
    console.log("\n📈 Verificando estadísticas actualizadas...");
    const updatedStats = await gameStatsService.getDashboardStats();
    console.log("📊 Estadísticas actualizadas del dashboard:");
    console.log(JSON.stringify(updatedStats, null, 2));

    console.log("\n🌐 Probando endpoint HTTP...");
    const express = require("express");
    const cors = require("cors");
    const app = express();
    const dashboardRoutes = require("./src/routes/dashboard.routes");
    
    app.use(cors());
    app.use(express.json());
    app.use("/api/dashboard", dashboardRoutes);
    
    const server = app.listen(3001, () => {
      console.log("🚀 Servidor de prueba iniciado en puerto 3001");
    });

    // Simular una petición HTTP
    const axios = require("axios");
    try {
      console.log("📡 Haciendo petición HTTP a /api/dashboard/stats...");
      const response = await axios.get("http://localhost:3001/api/dashboard/stats");
      console.log("✅ Respuesta del endpoint:");
      console.log(JSON.stringify(response.data, null, 2));
      
      // Verificar que los datos no estén en 0
      if (response.data.totalGames > 0) {
        console.log("🎉 ¡Las estadísticas se están mostrando correctamente!");
      } else {
        console.log("⚠️  Las estadísticas siguen mostrando 0. Revisar logs del servidor.");
      }
    } catch (error) {
      console.error("❌ Error en endpoint:", error.message);
    }

    server.close();
    await mongoose.disconnect();
    console.log("\n✅ Prueba de depuración completada");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDashboardDebug();

