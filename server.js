require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error.message));
db.once("open", () => console.log("Connection to the Database established"));

app.use(express.json());

const gamesRouter = require("./routes/games");
app.use("/api/games", gamesRouter);

app.listen(3000, () => console.log("Server started!"));
