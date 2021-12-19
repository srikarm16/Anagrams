const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require('body-parser');
const cookie = require("cookie");
const mongoose = require("mongoose");
const User = require("./models/User");
const Game = require("./models/Game");
const cookieParser = require('cookie-parser');

const { wordsInit, isValidWord, getScrambledLetters } = require('./words.js');

mongoose.connect('mongodb://localhost:27017/test').then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Failed to connect to database", err);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 5001;

const getGame = async () => {
  let games = await Game.find({});
  if (games.length === 0) {
    games.push(await Game.create({
      players: [],
      gameState: "ready",
      letters: [],
    }));
  }
  return games[0];
}
let game;
getGame().then((g) => {
  game = g;
  console.log(g);
});

const corsOptions = {
  origin: "http://localhost:5500",
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

io.on("connection", async (socket) => {
  var cookies = cookie.parse(socket.handshake.headers.cookie);    
  socket.id = cookies.id;
  socket.on("ready_update", async (ready) => {
    const user = await User.findOne({
      _id: mongoose.Types.ObjectId(socket.id),
    });
    user.ready = ready;
    await user.save();
    socket.broadcast.emit("ready_update", {
      _id: socket.id,
      ready
    });

    const users = await User.find({});
    let allReady = true;
    users.forEach((entry) => {
      if (entry.ready !== true)
        allReady = false;
    });

    if (allReady) {
      game.letters = getScrambledLetters(6);
      await game.save();
      socket.broadcast.emit("game_start");
    }
  });

  socket.on("disconnect", async () => {
    try {
      const user = await User.findOne({
        _id: mongoose.Types.ObjectId(socket.id),
      });
      user.connected = false;
      await user.save();
      socket.broadcast.emit("user_disconnected", socket.id);
    } catch(err) {
      console.log("Disconnect error", err);
    }
  });
});


app.get("/generate", (req, res) => {
  const len = req.query.length;
  const scrambledLetters = getScrambledLetters(parseInt(len));
  res.send(scrambledLetters);
});

app.get("/game-letters", (req, res) => {
  res.send(game.letters);
})

app.get("/check", (req, res) => {
  const word = req.query.word;
  res.send(isValidWord(word));
});

app.get("/user_list", async (req, res) => {
  const data = {};

  const users = await User.find({});
  users.forEach((user) => {
    data[user._id] = user;
  })
  res.json(data);
});

app.post("/create_user", async (req, res) => {
  const name = req.body.name;
  const gameMode = req.body.gameMode;

  const newUser = new User();
  newUser.gameMode = gameMode;
  newUser.name = name;
  newUser.score = 0;
  newUser.ready = false;

  newUser.connected = true;

  try {
    await newUser.save();
    res.cookie('id', newUser._id.toString(), {expires: new Date(253402300000000)}); // never expire
    res.json({
      name: name,
    });
    io.sockets.emit("new_user", newUser);
    game.players.push(newUser._id);
    await game.save();
  } catch(err) {
    res.status(401);
  }
});

httpServer.listen(port, () => {
  console.log (`Server running on port ${port}`);
  wordsInit();
});