// Script para crear datos de prueba en la base de datos
require("dotenv").config();
const mongoose = require("mongoose");
const GameStats = require("./src/models/gameStats.model");
const gameStatsService = require("./src/services/gameStats.service");

async function createTestData() {
  try {
    console.log("🔍 Conectando a la base de datos...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/triviapp");
    console.log("✅ Conectado a MongoDB");

    console.log("\n📊 Verificando datos existentes...");
    const existingStats = await GameStats.find({});
    console.log(`📈 Documentos existentes: ${existingStats.length}`);

    if (existingStats.length > 0) {
      console.log("⚠️  Ya existen estadísticas en la base de datos.");
      console.log("¿Deseas continuar y agregar más datos de prueba? (y/n)");
      // En un script real, podrías usar readline para input del usuario
      // Por ahora, continuamos automáticamente
    }

    console.log("\n🎮 Creando datos de prueba...");
    
    // Simular varias partidas terminadas
    const testGames = [
      {
        roomId: "test-room-1",
        players: [
          { playerId: "player1", playerName: "Ana", score: 8, eliminated: false },
          { playerId: "player2", playerName: "Carlos", score: 5, eliminated: true, eliminatedRound: 5 },
          { playerId: "player3", playerName: "Luis", score: 3, eliminated: true, eliminatedRound: 3 }
        ],
        questions: [
          { category: "Historia", text: "¿En qué año...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
          { category: "Ciencia", text: "¿Qué es...?", options: ["A", "B", "C", "D"], correctAnswer: "B" },
          { category: "Matemáticas", text: "¿Cuánto es...?", options: ["A", "B", "C", "D"], correctAnswer: "C" },
          { category: "Geografía", text: "¿Dónde está...?", options: ["A", "B", "C", "D"], correctAnswer: "D" },
          { category: "Deportes", text: "¿Quién ganó...?", options: ["A", "B", "C", "D"], correctAnswer: "A" }
        ],
        gameDuration: 450
      },
      {
        roomId: "test-room-2",
        players: [
          { playerId: "player4", playerName: "María", score: 6, eliminated: false },
          { playerId: "player5", playerName: "José", score: 4, eliminated: true, eliminatedRound: 4 },
          { playerId: "player6", playerName: "Sofia", score: 2, eliminated: true, eliminatedRound: 2 },
          { playerId: "player7", playerName: "Diego", score: 1, eliminated: true, eliminatedRound: 1 }
        ],
        questions: [
          { category: "Arte", text: "¿Quién pintó...?", options: ["A", "B", "C", "D"], correctAnswer: "B" },
          { category: "Literatura", text: "¿Quién escribió...?", options: ["A", "B", "C", "D"], correctAnswer: "C" },
          { category: "Música", text: "¿Quién compuso...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
          { category: "Cine", text: "¿Quién dirigió...?", options: ["A", "B", "C", "D"], correctAnswer: "D" }
        ],
        gameDuration: 320
      },
      {
        roomId: "test-room-3",
        players: [
          { playerId: "player8", playerName: "Roberto", score: 7, eliminated: false },
          { playerId: "player9", playerName: "Elena", score: 5, eliminated: true, eliminatedRound: 5 },
          { playerId: "player10", playerName: "Miguel", score: 3, eliminated: true, eliminatedRound: 3 }
        ],
        questions: [
          { category: "Tecnología", text: "¿Qué es...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
          { category: "Medicina", text: "¿Cuál es...?", options: ["A", "B", "C", "D"], correctAnswer: "B" },
          { category: "Física", text: "¿Cómo funciona...?", options: ["A", "B", "C", "D"], correctAnswer: "C" },
          { category: "Química", text: "¿Qué elemento...?", options: ["A", "B", "C", "D"], correctAnswer: "D" },
          { category: "Biología", text: "¿Qué proceso...?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
          { category: "Astronomía", text: "¿Qué planeta...?", options: ["A", "B", "C", "D"], correctAnswer: "B" }
        ],
        gameDuration: 600
      }
    ];

    console.log(`🎯 Procesando ${testGames.length} partidas de prueba...`);
    
    for (let i = 0; i < testGames.length; i++) {
      const game = testGames[i];
      console.log(`\n🎮 Procesando partida ${i + 1}/${testGames.length}: ${game.roomId}`);
      console.log(`👥 Jugadores: ${game.players.length}`);
      console.log(`❓ Preguntas: ${game.questions.length}`);
      console.log(`⏱️  Duración: ${game.gameDuration} segundos`);
      
      await gameStatsService.updateStatsAfterGame(game);
      console.log(`✅ Partida ${i + 1} procesada exitosamente`);
    }

    console.log("\n📊 Verificando estadísticas finales...");
    const finalStats = await gameStatsService.getDashboardStats();
    console.log("📈 Estadísticas finales del dashboard:");
    console.log(JSON.stringify(finalStats, null, 2));

    console.log("\n🎉 ¡Datos de prueba creados exitosamente!");
    console.log("💡 Ahora puedes verificar el dashboard en el navegador");

    await mongoose.disconnect();
    console.log("🔌 Conexión cerrada");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestData();

