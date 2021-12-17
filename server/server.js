const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require('body-parser');
const cookie = require("cookie");
const mongoose = require("mongoose");
const User = require("./models/User");
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
    const user = await User.findById({
      id: socket.id,
    });
    user.ready = ready;
    await user.save();
    socket.broadcast.emit("ready_update", {
      id: socket.id,
      ready
    });

    const users = await User.find({});
    let allReady = true;
    users.forEach((entry) => {
      if (entry.ready !== true)
        allReady = false;
    });

    if (allReady) {
      socket.broadcast.emit("game_start");
    }
  });

  socket.on("disconnect", async () => {
    const user = await User.findById({
      id: socket.id,
    });
    user.connected = false;
    await user.save();
    socket.broadcast.emit("user_disconnected", socket.id);
  });
});


app.get("/generate", (req, res) => {
  const len = req.query.length;
  const scrambledLetters = getScrambledLetters(parseInt(len));
  res.send(scrambledLetters);
});

app.get("/check", (req, res) => {
  const word = req.query.word;
  res.send(isValidWord(word));
});


app.get("/user_list", async (req, res) => {
  const data = {};
  const users = await User.find({});
  console.log(users);
  // users.forEach((val, key) => {
  //   data[key] = val;
  // })
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
    console.log(newUser);
    await newUser.save();
    res.cookie('id', newUser._id, {expires: new Date(253402300000000)}); // never expire
    res.json({
      name: name,
    });
  } catch(err) {
    res.status(401);
  }
});

httpServer.listen(port, () => {
  console.log (`Server running on port ${port}`);
  wordsInit();

  // const scrambledLetters = getScrambledLetters(10);
  // console.log(`Scrambled: ${scrambledLetters}`);
});

const createNewUser = (socket) => {
  numUsers++;
  const newUser = {
    ready: false,
    number: userIds,
    name: `User ${userIds}`,
    connected: true
  };
  console.log(newUser, userIds);
  socket.id = userIds;
  users.set(userIds, newUser);
  userIds++;
};