const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const puppeteer = require("puppeteer");

router.get("/", async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", (req, res) => {
  res.send(`${req.params.id} hello`);
});

module.exports = router;
