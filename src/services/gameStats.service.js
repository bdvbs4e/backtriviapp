const GameStats = require("../models/gameStats.model");
const PlayerResult = require("../models/playerResult.model");
const Question = require("../models/question.model");

// Obtener estadísticas actuales
exports.getCurrentStats = async () => {
  try {
    const stats = await GameStats.getOrCreateStats();
    return stats;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    throw error;
  }
};

// Actualizar estadísticas después de una partida
exports.updateStatsAfterGame = async (gameData) => {
  try {
    const { roomId, players, questions, gameDuration } = gameData;
    
    console.log("📊 Actualizando estadísticas para partida:", roomId);
    console.log("👥 Jugadores:", players.length);
    console.log("❓ Preguntas:", questions?.length || 0);
    
    // Obtener estadísticas actuales
    let stats = await GameStats.getOrCreateStats();
    console.log("📈 Estadísticas actuales:", {
      totalGames: stats.totalGamesPlayed,
      totalPlayers: stats.totalPlayers,
      totalQuestions: stats.totalQuestionsAnswered,
      totalCorrect: stats.totalCorrectAnswers
    });
    
    // Actualizar contadores generales
    stats.totalGamesPlayed += 1;
    stats.totalPlayers += players.length;
    
    // Calcular preguntas respondidas y respuestas correctas
    const questionsAnswered = players.reduce((total, player) => total + (player.score || 0), 0);
    const correctAnswers = players.reduce((total, player) => total + (player.score || 0), 0);
    
    stats.totalQuestionsAnswered += questionsAnswered;
    stats.totalCorrectAnswers += correctAnswers;
    
    console.log("🔢 Nuevos valores:", {
      totalGames: stats.totalGamesPlayed,
      totalPlayers: stats.totalPlayers,
      totalQuestions: stats.totalQuestionsAnswered,
      totalCorrect: stats.totalCorrectAnswers
    });
    
    // Actualizar top ganadores
    await updateTopWinners(stats, players);
    
    // Actualizar categorías más acertadas
    await updateTopCategories(stats, questions);
    
    // Actualizar estadísticas diarias
    updateDailyStats(stats, gameDuration);
    
    // Guardar estadísticas actualizadas
    await stats.save();
    console.log("✅ Estadísticas guardadas exitosamente");
    
    return stats;
  } catch (error) {
    console.error("Error actualizando estadísticas:", error);
    throw error;
  }
};

// Actualizar top ganadores
async function updateTopWinners(stats, players) {
  const winner = players.find(p => !p.eliminated);
  if (!winner) return;
  
  // Buscar si el ganador ya existe en el top
  let existingWinner = stats.topWinners.find(w => w.playerId === winner.playerId || w.playerId === winner.id);
  
  if (existingWinner) {
    existingWinner.wins += 1;
    existingWinner.totalScore += winner.score || 0;
    existingWinner.gamesPlayed += 1;
    existingWinner.winRate = existingWinner.wins / existingWinner.gamesPlayed;
  } else {
    // Agregar nuevo ganador
    stats.topWinners.push({
      playerId: winner.playerId || winner.id,
      playerName: winner.playerName || winner.name,
      wins: 1,
      totalScore: winner.score || 0,
      gamesPlayed: 1,
      winRate: 1
    });
  }
  
  // Ordenar por victorias y mantener solo los top 10
  stats.topWinners.sort((a, b) => b.wins - a.wins);
  stats.topWinners = stats.topWinners.slice(0, 10);
}

// Actualizar categorías más acertadas
async function updateTopCategories(stats, questions) {
  if (!questions || questions.length === 0) return;
  
  for (const question of questions) {
    const category = question.category;
    let existingCategory = stats.topCategories.find(c => c.category === category);
    
    if (existingCategory) {
      existingCategory.timesAsked += 1;
      // Aquí podrías agregar lógica para contar respuestas correctas por categoría
      existingCategory.accuracy = existingCategory.timesCorrect / existingCategory.timesAsked;
    } else {
      stats.topCategories.push({
        category: category,
        timesAsked: 1,
        timesCorrect: 0, // Se actualizaría con datos más detallados
        accuracy: 0
      });
    }
  }
  
  // Ordenar por precisión y mantener solo los top 10
  stats.topCategories.sort((a, b) => b.accuracy - a.accuracy);
  stats.topCategories = stats.topCategories.slice(0, 10);
}

// Actualizar estadísticas diarias
function updateDailyStats(stats, gameDuration) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let todayStats = stats.dailyStats.find(d => 
    d.date.getTime() === today.getTime()
  );
  
  if (todayStats) {
    todayStats.gamesPlayed += 1;
    // Actualizar duración promedio
    const totalGames = todayStats.gamesPlayed;
    todayStats.averageGameDuration = 
      (todayStats.averageGameDuration * (totalGames - 1) + gameDuration) / totalGames;
  } else {
    stats.dailyStats.push({
      date: today,
      gamesPlayed: 1,
      playersOnline: 0, // Se actualizaría con datos de conexión
      averageGameDuration: gameDuration
    });
  }
  
  // Mantener solo los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  stats.dailyStats = stats.dailyStats.filter(d => d.date >= thirtyDaysAgo);
}

// Obtener estadísticas para el dashboard
exports.getDashboardStats = async () => {
  try {
    const stats = await GameStats.getOrCreateStats();
    
    return {
      totalGames: stats.totalGamesPlayed,
      totalPlayers: stats.totalPlayers,
      totalQuestions: stats.totalQuestionsAnswered,
      totalCorrectAnswers: stats.totalCorrectAnswers,
      accuracy: stats.totalQuestionsAnswered > 0 ? 
        (stats.totalCorrectAnswers / stats.totalQuestionsAnswered * 100).toFixed(2) : 0,
      topWinners: stats.topWinners.slice(0, 5),
      topCategories: stats.topCategories.slice(0, 5),
      lastUpdated: stats.lastUpdated
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error);
    throw error;
  }
};
