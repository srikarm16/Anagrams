const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { wordsInit, isValidWord, getScrambledLetters } = require('./words.js');
const { appendFileSync } = require("fs");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 5001;

app.use(cors());
app.use(express.json({extended: true}));

const rooms = [1, 2, 3, 4];


let numUsers = 0;
let userIds = 0;
const users = new Map();

io.on("connection", (socket) => {
  // ...
  socket.on('connected', (id) => {
      console.log(users);
    if (id === -1) {
      createNewUser(socket);
    } else {
      console.log("ID: ", id, users.has(id));
      socket.id = id;
      users.get(socket.id).connected = true;
    }
    socket.emit("your_id", socket.id);
    socket.broadcast.emit("new_user", users.get(socket.id));
  });


  socket.on("ready_update", (ready) => {
    users.get(socket.id).ready = ready;
    socket.broadcast.emit("ready_update", {
      id: socket.id,
      ready
    });


    let allReady = true;
    users.forEach((entry, id) => {
      if (users.get(id).ready !== true)
        allReady = false;
    });

    if (allReady) {
      socket.broadcast.emit("game_start");
    }
  });

  socket.on("disconnect", () => {
    users.get(socket.id).connected = false;
    socket.broadcast.emit("user_disconnected", socket.id);
    numUsers--;
  });
  // socket.join(rooms.shift());
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

app.get("/user_list", (req, res) => {
  const data = {};
  users.forEach((val, key) => {
    data[key] = val;
  })
  res.json(data);
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