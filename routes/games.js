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

  //await page.click(".show_link");

  // Extract the results from the page.
  const links = await page.evaluate((resultsSelector) => {
    const title = document.querySelector(".page-title").innerText;
    let description = document.querySelector(resultsSelector).innerText;
    let gameData = [...document.querySelector("div.body > ol").children].map(
      (node) => node.children[0].children[1].innerText
    );
    return {
      description,
      name: title.slice(0, title.length - 18),
      genre: gameData[0] ?? "N/A",
      developer: gameData[1] ?? "N/A",
      esrb: gameData[2] ?? "N/A",
      localPlayers: gameData[3] ?? "N/A",
      onlinePlayers: gameData[4] ?? "N/A",
      wikipedia: gameData[5] ?? "N/A",
    };
  }, resultsSelector);

  console.log({ ...links, path });
  await browser.close();
  return { ...links, path };
}

async function gameFaqsSearch(query) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`${GAMEFAQS_URL}`);

  // Type into search box.
  await page.type("#searchtextbox", query);

  // Wait for suggest overlay to appear and click "show all results".
  //const allResultsSelector = ".devsite-suggest-all-results";
  //await page.waitForSelector(allResultsSelector);
  await page.click(".mh_search");

  // Wait for the results page to load and display the results.
  const resultsSelector = ".search_result";
  page.setDefaultTimeout(2000);
  await page.waitForSelector(resultsSelector);

  // Extract the results from the page.
  const links = await page.evaluate((resultsSelector) => {
    const nodes = document.querySelectorAll(resultsSelector);
    let searchQuery = [];
    for (let i = 0; i < nodes.length; i++) {
      let title = nodes[i].children[1].children[0].children[0].children[0].children[0].innerText;
      let url = nodes[i].children[1].children[0].children[0].children[0].children[0].href;
      searchQuery.push({ title, url });
    }
    console.log(searchQuery);
    return searchQuery;
  }, resultsSelector);

  console.log(links);
  await browser.close();
  return links;
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
      const { name, description, path, genre, developer, esrb, localPlayers, onlinePlayers, wikipedia } =
        await getGameFaqsData(req.params.id, req.params.platform);
      const game = new Game({
        name,
        description,
        path,
        genre,
        developer,
        esrb,
        localPlayers,
        onlinePlayers,
        wikipedia,
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
