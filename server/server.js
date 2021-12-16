const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { wordsInit, isValidWord, getScrambledLetters } = require('./words.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 5001;

app.use(cors());
app.get("/generate", (req, res) => {
    const len = req.query.length;
    const scrambledLetters = getScrambledLetters(parseInt(len));
    res.send(scrambledLetters);
});

app.get("/check", (req, res) => {
  const word = req.query.word;
  res.send(isValidWord(word));
});

const rooms = [1, 2, 3, 4];

io.on("connection", (socket) => {
  // ...
  socket.join(rooms.shift());
});

httpServer.listen(port, () => {
  console.log (`Server running on port ${port}`);
  wordsInit();

  // const scrambledLetters = getScrambledLetters(10);
  // console.log(`Scrambled: ${scrambledLetters}`);
});
