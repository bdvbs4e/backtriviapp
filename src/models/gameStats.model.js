const mongoose = require("mongoose");

const gameStatsSchema = new mongoose.Schema({
  // Estadísticas generales
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  totalPlayers: {
    type: Number,
    default: 0
  },
  totalQuestionsAnswered: {
    type: Number,
    default: 0
  },
  totalCorrectAnswers: {
    type: Number,
    default: 0
  },
  
  // Top ganadores (máximo 10)
  topWinners: [{
    playerId: {
      type: String,
      required: true
    },
    playerName: {
      type: String,
      required: true
    },
    wins: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    }
  }],
  
  // Categorías más acertadas (máximo 10)
  topCategories: [{
    category: {
      type: String,
      required: true
    },
    timesAsked: {
      type: Number,
      default: 0
    },
    timesCorrect: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    }
  }],
  
  // Estadísticas por día (últimos 30 días)
  dailyStats: [{
    date: {
      type: Date,
      required: true
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    playersOnline: {
      type: Number,
      default: 0
    },
    averageGameDuration: {
      type: Number,
      default: 0
    }
  }],
  
  // Última actualización
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Versión para control de concurrencia
  version: {
    type: Number,
    default: 0
  }
});

// Índices para optimizar consultas
gameStatsSchema.index({ lastUpdated: -1 });
gameStatsSchema.index({ "topWinners.wins": -1 });
gameStatsSchema.index({ "topCategories.accuracy": -1 });

// Middleware para actualizar lastUpdated y version
gameStatsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.version += 1;
  next();
});

// Método estático para obtener o crear estadísticas
gameStatsSchema.statics.getOrCreateStats = async function() {
  let stats = await this.findOne().sort({ lastUpdated: -1 });
  if (!stats) {
    stats = new this({});
    await stats.save();
  }
  return stats;
};

module.exports = mongoose.model("GameStats", gameStatsSchema);

