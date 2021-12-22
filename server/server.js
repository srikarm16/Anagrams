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
const luxon = require("luxon");

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
  origin: ["http://localhost:5500", "http://192.168.1.213:5500"],
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

io.on("connection", async (socket) => {
  if (socket.handshake.headers.cookie === undefined) {
    socket.disconnect();
  }
  // console.log(socket.handshake.headers.cookie);
  var cookies = cookie.parse(socket.handshake.headers.cookie); 
  let user;
  if (cookies) {
    socket.id = cookies.id;
     user = await User.findOne({
      _id: mongoose.Types.ObjectId(socket.id),
    });
    if (!user) {
      socket.disconnect();
      return;
    }
    user.connected = true;
    user.save();
  }
  else {
    socket.disconnect();
    return;
  }

  if (user.gameMode === "playing") {
    socket.broadcast.emit("user_connected", user);
  }
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
    users.forEach(async (entry) => {
      if (entry.connected && entry.gameMode === "playing" && entry.ready !== true)
        allReady = false;
    });


    if (allReady) {
      game.players = [];
      game.gameState = "playing";
      for (let i = 0; i < users.length; i++) {
        if (users[i].connected && users[i].gameMode === "playing") {
          users[i].score = 0;
          users[i].words = [];
          users[i].ready = false;
          await users[i].save();
          game.players.push(users[i]._id);

        }
      }
      game.letters = getScrambledLetters(game.wordLength);
      game.endTime = luxon.DateTime.now().plus({minutes: 1, seconds: 6,}).toMillis();
      await game.save();
      socket.broadcast.emit("game_start", game.endTime);
    }
  });

  socket.on("word_length_changed", async (wordLength) => {
    game.wordLength = wordLength;
    await game.save();
    socket.broadcast.emit("word_length_changed", wordLength);
  }) 

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

app.get("/getdatetimejson", (req, res) => {
  const clientTime = req.query.ct;
  const serverTimestamp = (new Date()).getTime();
  const serverClientRequestDiffTime = serverTimestamp - clientTime;
  res.json({
    diff: serverClientRequestDiffTime,
    serverTimestamp,
  });
})


app.get("/generate", (req, res) => {
  const len = req.query.length;
  const scrambledLetters = getScrambledLetters(parseInt(len));
  res.send(scrambledLetters);
});

app.get("/game-letters", (req, res) => {
  res.send(game.letters);
})

app.post("/submit_word", async (req, res) => {
  const word = req.body.word;
  const validWord = isValidWord(word);
  if (!validWord) {
    return res.json({
      valid: false,
    });
  }
  const user = await User.findOne({
    _id: req.cookies.id,
  });
  if (user.words.includes(word)) {
    return res.json({
      valid: true,
      alreadyUsed: true,
    });
  }
  const scoreChange = 400;
  user.score += scoreChange;
  user.words.push(word);
  await user.save();
  io.sockets.emit("word_entered", {
    scoreChange,
    score: user.score,
    _id: user._id,
  });
  return res.json({
    valid: true,
    alreadyUsed: false,
    score: user.score,
    scoreChange,
    word 
  })
})

app.get("/check", (req, res) => {
  const word = req.query.word;
  res.send(isValidWord(word));
});

app.get("/game_users", async (req, res) => {
  const data = {
    wordLength: game.wordLength,
    gameState: game.gameState,
    users: {
    },
  };
  if (game.gameState === "ready") {
    const users = await User.find({});
    users.forEach((user) => {
      if (user.connected && user.gameMode === "playing") {
        data.users[user._id] = user;
      }
    });
  } else {
    for (let i = 0; i < game.players.length; i++) {
      data.users[game.players[i]] = await User.findOne({
        _id: game.players[i],
      });
    }
  }
  res.json(data);
})

app.post("/game_done", async (req, res) => {
  if (game.gameState === "playing") {
    game.gameState = "ready";
    const players = [];
    for (let i = 0; i < game.players.length; i++) {
      const user = await User.findOne({
        _id: game.players[i]
      });
      players.push(user);
    }
    players.sort((a, b) => b.score - a.score);
    console.log(players);
    game.first = players[0];
    game.second = players[1];
    game.third = players[2];
    game.playerRankings = players;
    game.players = players.map((player) => player._id);
    await game.save();
    io.sockets.emit("game_done");
  }
  res.send("Successful");
})

app.get("/user_list", async (req, res) => {
  const data = {
    wordLength: game.wordLength,
    gameState: game.gameState,
    users: {
    },
  };

  const users = await User.find({});
  users.forEach((user) => {
    if (user.connected && user.gameMode === "playing") {
      data.users[user._id] = user;
    }
  });

  res.json(data);
});

app.get("/get_score", async (req, res) => {
  const user = await User.findOne({
    _id: req.cookies.id,
  });
  res.json({
    score: user.score,
  });
});

app.post("/change_mode", async (req, res) => {
  const user = await User.findOne({
    _id: mongoose.Types.ObjectId(req.cookies.id),
  });
  if (req.body.gameMode === "playing" && user.gameMode === "spectating") {
    io.sockets.emit("user_connected", user);
  }

  user.gameMode = req.body.gameMode;
  await user.save();
  res.send("successful");
});

app.get("/game_results", async (req, res) => {
  const user = await User.findOne({_id: mongoose.Types.ObjectId(req.cookies.id)});
  const data = {
    first: game.first,
    second: game.second,
    third: game.third,
    overall: game.playerRankings,
    you: user,
  };
  for (let i = 0; i < game.players; i++) {
    if (game.players[i] == user) {
      data.position = i + 1;
      break;
    }
  }
  res.json(data);
})

app.get("/get_end_time", async (req, res) => {
  if (game.gameState === "ready") {
    res.json({
      state: "ready",
    })
  } else {
    res.json({
      state: "playing", 
      endTime: game.endTime,
    });
  }
})

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