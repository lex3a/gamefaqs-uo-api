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

  page.on("console", async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  const links = await page.evaluate((resultsSelector) => {
    const title = document.querySelector(".page-title").innerText;
    let description = document.querySelector(resultsSelector).innerText;
    let gameData = [...document.querySelector("div.body > ol").children].map((node) => {
      return { tableTitle: node.children[0].children[0].innerText, tableValue: node.children[0].children[1].innerText };
    });
    let score = document.querySelector(".score");
    let metacriticScore = 0;
    if (score) metacriticScore = +score.innerText;
    let releaseDates = [...document.querySelector(".contrib > tbody").children].map((node) => node.innerText);

    let parsedReleaseDates = [];
    for (let i = 0; i < releaseDates.length; i += 2) {
      let title = releaseDates[i].trim();
      let [region, publisher, productId, distributionOrBarcode, releaseDate, rating] = releaseDates[i + 1].split("\t");
      parsedReleaseDates.push({ title, region, publisher, productId, distributionOrBarcode, releaseDate, rating });
    }
    const tableValues = [
      ["Genre", "genre"],
      ["Developer", "developer"],
      ["ESRB", "esrb"],
      ["Local", "localPlayers"],
      ["Online", "onlinePlayers"],
      ["Wikipedia", "wikipedia"],
    ];

    let processedGameData = {
      genre: "N/A",
      developer: "N/A",
      esrb: "N/A",
      localPlayers: "N/A",
      onlinePlayers: "N/A",
      wikipedia: "N/A",
    };

    for (let i = 0; i < tableValues.length; i++) {
      for (let j = 0; j < gameData.length; j++) {
        if (gameData[j].tableTitle.includes(tableValues[i][0])) {
          processedGameData[tableValues[i][1]] = gameData[j].tableValue;
        }
      }
    }

    return {
      description,
      name: title.slice(0, title.length - 18), // Remove " – Release Details"
      ...processedGameData,
      metacritic: metacriticScore,
      releaseData: parsedReleaseDates,
    };
  }, resultsSelector);

  console.log({ ...links, path });
  await browser.close();
  return { ...links, path };
}

module.exports = getGameFaqsData;
