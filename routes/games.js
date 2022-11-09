const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const getGameFaqsData = require("../scrapper/gamefaqs");

router.get("/", async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:platform/:id", async (req, res) => {
  try {
    console.log(req.params);
    let isGameExists = await Game.exists({ path: req.params.id });
    console.log(isGameExists);
    if (isGameExists) {
      res.status(200).json(await Game.findById(isGameExists));
    } else {
      const gameData = await getGameFaqsData(req.params.id, req.params.platform);
      const game = new Game({
        ...gameData,
      });
      const newGame = await game.save();
      res.status(200).json(newGame);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
