// Script de prueba para verificar las estadísticas
const mongoose = require("mongoose");
require("dotenv").config();

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/triviapp");
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

// Importar modelos y servicios
const GameStats = require("./src/models/gameStats.model");
const gameStatsService = require("./src/services/gameStats.service");

async function testStats() {
  try {
    await connectDB();
    
    console.log("🧪 Probando sistema de estadísticas...");
    
    // Crear estadísticas iniciales
    console.log("📊 Creando estadísticas iniciales...");
    const initialStats = await gameStatsService.getCurrentStats();
    console.log("✅ Estadísticas iniciales:", {
      totalGames: initialStats.totalGamesPlayed,
      totalPlayers: initialStats.totalPlayers,
      lastUpdated: initialStats.lastUpdated
    });
    
    // Simular una partida terminada
    console.log("🎮 Simulando partida terminada...");
    const mockGameData = {
      roomId: "test-room-123",
      players: [
        { playerId: "player1", playerName: "Juan", score: 5, eliminated: false },
        { playerId: "player2", playerName: "María", score: 3, eliminated: true, eliminatedRound: 3 },
        { playerId: "player3", playerName: "Pedro", score: 2, eliminated: true, eliminatedRound: 2 }
      ],
      questions: [
        { category: "Historia", text: "¿En qué año...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
        { category: "Ciencia", text: "¿Qué es...?", options: ["A", "B", "C", "D"], correctAnswer: "B" }
      ],
      gameDuration: 300 // 5 minutos
    };
    
    await gameStatsService.updateStatsAfterGame(mockGameData);
    console.log("✅ Estadísticas actualizadas después de la partida");
    
    // Obtener estadísticas del dashboard
    console.log("📈 Obteniendo estadísticas del dashboard...");
    const dashboardStats = await gameStatsService.getDashboardStats();
    console.log("✅ Estadísticas del dashboard:", dashboardStats);
    
    console.log("🎉 ¡Prueba completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
}

// Ejecutar prueba
testStats();

