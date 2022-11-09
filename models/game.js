const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
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
  metacritic: {
    type: Number,
    required: true,
  },
  releaseData: [
    new Schema({
      distributionOrBarcode: String,
      productId: String,
      publisher: String,
      rating: String,
      region: String,
      releaseDate: String,
      title: String,
    }),
  ],
});

module.exports = mongoose.model("Game", gameSchema);
