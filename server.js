// Cambios claves:
// 1. En player-join: no dejar entrar si ya hay 5 jugadores
// 2. En player-ready: solo iniciar si === REQUIRED_PLAYERS y todos listos
// 3. En endGame: NO borrar la sala, resetearla a waiting para que los mismos 5 puedan seguir jugando

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db.config");
const questionRoutes = require("./src/routes/question.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const gameRoutes = require("./src/routes/game.routes");
const playerResultRoutes = require("./src/routes/playerResult.routes");

const app = express();
const PORT = process.env.PORT || 3000;
const REQUIRED_PLAYERS = parseInt(process.env.REQUIRED_PLAYERS || "5");
const QUESTION_COUNT = parseInt(process.env.QUESTION_COUNT || "24");

app.use(express.json());
app.use(cors());

connectDB();

const userRoutes = require("./src/routes/user.routes");
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/player-results", playerResultRoutes);

app.get("/", (req, res) => res.send("API OK"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const Game = require("./src/models/game.model");
const Question = require("./src/models/question.model");
const playerResultService = require("./src/services/playerResult.service");
const gameStatsService = require("./src/services/gameStats.service");

let rooms = [];

// 🔄 Restaurar salas persistentes
(async () => {
  try {
    const existingGames = await Game.find({
      status: { $in: ["waiting", "started"] },
    });
    rooms = existingGames.map((g) => ({
      roomId: g.roomId,
      status: g.status,
      players: g.players || [],
      startedAt: g.startedAt,
      questions: g.questionsLog || [],
      currentQuestionIndex: g.currentQuestionIndex || 0,
    }));
    console.log(`♻️ Restauradas ${rooms.length} salas desde Mongo`);
  } catch (err) {
    console.error("⚠️ No se pudieron restaurar salas:", err);
  }
})();

let creatingRoom = false;

const dashboard = io.of("/dashboard");
function emitDashboardUpdate() {
  dashboard.emit("dashboard-update", {
    rooms: rooms.map((r) => ({
      roomId: r.roomId,
      status: r.status,
      players: r.players,
      currentQuestionIndex: r.currentQuestionIndex,
      currentQuestion: r.questions?.[r.currentQuestionIndex] || null,
    })),
  });
}

dashboard.on("connection", (socket) => {
  console.log("📊 Cliente dashboard conectado:", socket.id);
  emitDashboardUpdate();
  socket.on("dashboard-join", () => emitDashboardUpdate());
});

async function findOrCreateRoom(forceNew = false) {
  while (creatingRoom) await new Promise((res) => setTimeout(res, 50));
  creatingRoom = true;

  let room = !forceNew
    ? rooms.find((r) => r.status === "waiting" && r.players.length < REQUIRED_PLAYERS)
    : null;

  if (!room) {
    room = {
      roomId: `room-${Date.now()}`,
      status: "waiting",
      players: [],
      questions: [],
      currentQuestionIndex: 0,
    };
    rooms.push(room);
    await Game.create({ roomId: room.roomId, players: [], status: "waiting" });
    emitDashboardUpdate();
  }

  creatingRoom = false;
  return room;
}

async function emitLobbyUpdate(io, room) {
  for (const player of room.players) {
    await playerResultService.createOrUpdatePlayerResult(room.roomId, {
      id: player.id,
      name: player.name,
      score: player.score || 0,
      eliminated: player.eliminated || false,
      eliminatedRound: player.round || null,
      connected: player.connected !== false,
      ready: player.ready || false,
      gameStatus: room.status
    });
  }

  const dbResults = await playerResultService.getPlayerResultsByRoom(room.roomId);
  
  io.to(room.roomId).emit("lobby-update", {
    roomId: room.roomId,
    status: room.status,
    players: room.players,
    dbResults
  });
  
  await Game.findOneAndUpdate(
    { roomId: room.roomId },
    {
      players: room.players,
      status: room.status,
      currentQuestionIndex: room.currentQuestionIndex,
      questionsLog: room.questions,
    },
    { new: true }
  );
  emitDashboardUpdate();
}

async function emitResultsUpdate(io, room) {
  const dbResults = await playerResultService.getPlayerResultsByRoom(room.roomId);
  
  const winner = room.players ? room.players.find((p) => !p.eliminated) || null : null;
  const dbWinner = dbResults.find((p) => !p.eliminated) || null;
  
  io.to(room.roomId).emit("results-update", {
    players: room.players || [],
    dbResults,
    winner: winner || dbWinner,
  });
  emitDashboardUpdate();
}

async function endGame(io, room) {
  room.status = "finished";
  const winner = room.players.find((p) => !p.eliminated) || null;
  await playerResultService.updateGameStatus(room.roomId, "finished");

  try {
    const gameDuration = room.startedAt ? Math.floor((new Date() - room.startedAt) / 1000) : 0;
    await gameStatsService.updateStatsAfterGame({
      roomId: room.roomId,
      players: room.players,
      questions: room.questions,
      gameDuration
    });
  } catch (error) {
    console.error("Error actualizando estadísticas globales:", error);
  }

  io.to(room.roomId).emit("game-over", {
    winner,
    players: room.players,
    roomId: room.roomId,
  });
  await emitResultsUpdate(io, room);

  // 🔁 En lugar de borrar la sala, la reseteamos para que los mismos 5 puedan seguir jugando
  room.status = "waiting";
  room.players = room.players.map((p) => ({
    ...p,
    ready: false,
    eliminated: false,
    score: 0,
    answered: false
  }));
  room.questions = [];
  room.currentQuestionIndex = 0;
  room.startedAt = null;

  await Game.findOneAndUpdate(
    { roomId: room.roomId },
    {
      status: "waiting",
      players: room.players,
      questionsLog: [],
      currentQuestionIndex: 0,
      finishedAt: new Date(),
    }
  );

  emitDashboardUpdate();
}

async function startRound(io, room) {
  if (!room.questions || room.questions.length === 0) {
    const randomQuestions = await Question.aggregate([{ $sample: { size: QUESTION_COUNT } }]);
    room.questions = randomQuestions;
    room.currentQuestionIndex = 0;
    console.log(`🎲 Seleccionadas ${randomQuestions.length} preguntas para ${room.roomId}`);
  }

  if (room.currentQuestionIndex >= room.questions.length) {
    return endGame(io, room);
  }

  const question = room.questions[room.currentQuestionIndex];
  room.players = room.players.map((p) => ({ ...p, answered: false }));

  io.to(room.roomId).emit("new-question", question);
  dashboard.emit("question-sent", {
    roomId: room.roomId,
    question: { id: question._id, text: question.text },
  });

  setTimeout(async () => {
    room.players = room.players.map((p) =>
      p.answered ? p : { ...p, eliminated: true, round: room.currentQuestionIndex + 1 }
    );

    const alive = room.players.filter((p) => !p.eliminated);

    io.to(room.roomId).emit("round-results", {
      players: room.players,
      correctAnswer: question.correctAnswer,
    });

    dashboard.emit("round-results", {
      roomId: room.roomId,
      players: room.players,
      correctAnswer: question.correctAnswer,
    });

    emitResultsUpdate(io, room);

    if (alive.length === 0) return endGame(io, room);
    if (alive.length === 1) return endGame(io, room);

    room.currentQuestionIndex++;
    await emitLobbyUpdate(io, room);
    setTimeout(() => startRound(io, room), 2000);
  }, 5000);
}

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("player-join", async (playerData) => {
    const room = await findOrCreateRoom(playerData.forceNew);

    if (room.players.length >= REQUIRED_PLAYERS) {
      socket.emit("room-full", { message: "La sala ya tiene el máximo de jugadores (5)" });
      return;
    }

    let existing = room.players.find((p) => p.id === playerData.id);
    if (existing) {
      existing.connected = true;
      existing.socketId = socket.id;
    } else {
      room.players.push({
        ...playerData,
        socketId: socket.id,
        ready: false,
        connected: true,
        eliminated: false,
        score: 0,
      });
    }

    socket.join(room.roomId);
    await emitLobbyUpdate(io, room);
  });

  socket.on("player-ready", async (playerId) => {
    const room = rooms.find((r) => r.players.some((p) => p.id === playerId));
    if (!room) return;
    if (room.status === "started") return;

    room.players = room.players.map((p) =>
      p.id === playerId ? { ...p, ready: true } : p
    );

    await emitLobbyUpdate(io, room);

    const allReady = room.players.length === REQUIRED_PLAYERS && room.players.every((p) => p.ready);

    if (allReady && room.status !== "started") {
      room.status = "started";
      room.startedAt = new Date();
      await Game.findOneAndUpdate(
        { roomId: room.roomId },
        { status: "started", startedAt: room.startedAt }
      );
      io.to(room.roomId).emit("start-game", { roomId: room.roomId });
      emitDashboardUpdate();
      setTimeout(() => startRound(io, room), 1500);
    }
  });

  socket.on("player-answer", async ({ roomId, playerId, answer, correctAnswer }) => {
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return;

    room.players = room.players.map((p) => {
      if (p.id === playerId) {
        const isCorrect = answer === correctAnswer;
        return {
          ...p,
          answered: true,
          eliminated: !isCorrect,
          round: !isCorrect ? room.currentQuestionIndex + 1 : p.round,
          score: isCorrect ? (p.score || 0) + 1 : p.score || 0,
        };
      }
      return p;
    });

    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      await playerResultService.updatePlayerScore(roomId, playerId, player.score);
      if (player.eliminated) {
        await playerResultService.updatePlayerElimination(roomId, playerId, true, player.round);
      }
    }

    await emitResultsUpdate(io, room);
  });

  socket.on("player-leave", async ({ id, roomId }) => {
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== id);
    if (room.players.length === 0) {
      rooms = rooms.filter((r) => r.roomId !== room.roomId);
      await Game.findOneAndDelete({ roomId: room.roomId });
      emitDashboardUpdate();
    } else {
      await emitLobbyUpdate(io, room);
    }
  });

  socket.on("disconnect", async () => {
    const room = rooms.find((r) =>
      r.players.some((p) => p.socketId === socket.id)
    );
    if (!room) return;

    room.players = room.players.map((p) =>
      p.socketId === socket.id ? { ...p, connected: false } : p
    );
    await emitLobbyUpdate(io, room);

    setTimeout(async () => {
      const stillDisconnected = room.players.find(
        (p) => p.socketId === socket.id && !p.connected
      );
      if (stillDisconnected) {
        room.players = room.players.filter((p) => p.socketId !== socket.id);
        await emitLobbyUpdate(io, room);
      }
    }, 15000);
  });

  socket.on("get-results", async ({ roomId }) => {
    try {
      const dbResults = await playerResultService.getPlayerResultsByRoom(roomId);
      
      if (dbResults && dbResults.length > 0) {
        const winner = dbResults.find((p) => !p.eliminated) || null;
        socket.emit("results-update", {
          players: dbResults,
          dbResults,
          winner,
        });
        return;
      }

      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        const winner = room.players.find((p) => !p.eliminated) || null;
        socket.emit("results-update", {
          players: room.players,
          winner,
        });
        return;
      }

      const dbGame = await Game.findOne({ roomId });
      if (dbGame) {
        const winner = (dbGame.players || []).find((p) => !p.eliminated) || null;
        socket.emit("results-update", {
          players: dbGame.players || [],
          winner,
        });
      }
    } catch (err) {
      console.error("Error en get-results:", err);
    }
  });
});




server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${PORT}`);
});
