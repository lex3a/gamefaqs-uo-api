const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const puppeteer = require("puppeteer");

const GAMEFAQS_URL = "https://gamefaqs.gamespot.com/";

async function getGameFaqsData(path, platform) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`${GAMEFAQS_URL}/${platform}/${path}/data`);
  console.log(`${path}/data`);

  const resultsSelector = ".game_desc";
  page.setDefaultTimeout(500);
  await page.waitForSelector(resultsSelector);

  const links = await page.evaluate((resultsSelector) => {
    const title = document.querySelector(".page-title").innerText;
    let description = document.querySelector(resultsSelector).innerText;
    let gameData = [...document.querySelector("div.body > ol").children].map(
      (node) => node.children[0].children[1].innerText
    );
    let metacriticScore = document.querySelector(".score").innerText;
    let releaseDates = [...document.querySelector(".contrib > tbody").children].map((node) => node.innerText);

    let parsedReleaseDates = [];
    for (let i = 0; i < releaseDates.length; i += 2) {
      let title = releaseDates[i].trim();
      let [region, publisher, productId, distributionOrBarcode, releaseDate, rating] = releaseDates[i + 1].split("\t");
      parsedReleaseDates.push({ title, region, publisher, productId, distributionOrBarcode, releaseDate, rating });
    }

    return {
      description,
      name: title.slice(0, title.length - 18),
      genre: gameData[0] ?? "N/A",
      developer: gameData[1] ?? "N/A",
      esrb: gameData[2] ?? "N/A",
      localPlayers: gameData[3] ?? "N/A",
      onlinePlayers: gameData[4] ?? "N/A",
      wikipedia: gameData[5] ?? "N/A",
      metacritic: +metacriticScore ?? 0,
      releaseData: parsedReleaseDates,
    };
  }, resultsSelector);

  console.log({ ...links, path });
  await browser.close();
  return { ...links, path };
}

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
