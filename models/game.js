const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  developer: {
    type: String,
    required: true,
  },
  esrb: {
    type: String,
    required: true,
  },
  localPlayers: {
    type: String,
    required: true,
  },
  onlinePlayers: {
    type: String,
    required: true,
  },
  wikipedia: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Game", gameSchema);
