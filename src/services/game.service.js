const Game = require("../models/game.model");
const Question = require("../models/question.model");

exports.getAllGames = async () => {
  return await Game.find();
};

exports.getStats = async () => {
  const totalGames = await Game.countDocuments({ status: "finished" });

  const winners = await Game.aggregate([
    { $match: { status: "finished" } },
    { $unwind: "$players" },
    { $match: { "players.eliminated": false } },
    {
      $group: {
        _id: "$players.name",
        wins: { $sum: 1 },
      },
    },
    { $sort: { wins: -1 } },
    { $limit: 5 },
  ]);

  const categories = await Question.aggregate([
    {
      $project: {
        category: 1,
        timesAsked: 1,
        timesCorrect: 1,
        accuracy: {
          $cond: [
            { $eq: ["$timesAsked", 0] },
            0,
            { $divide: ["$timesCorrect", "$timesAsked"] },
          ],
        },
      },
    },
    { $sort: { accuracy: -1, timesAsked: -1 } },
    { $limit: 5 },
  ]);

  return {
    totalGames,
    winners,
    topCategories: categories,
  };
};

exports.createGame = async (roomId) => {
  return await Game.create({ roomId, status: "waiting", players: [] });
};

exports.updateGame = async (roomId, data) => {
  return await Game.findOneAndUpdate({ roomId }, data, { new: true });
};

exports.deleteGame = async (roomId) => {
  return await Game.findOneAndDelete({ roomId });
};
