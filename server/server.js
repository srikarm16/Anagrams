const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 5001;

const rooms = [1, 2, 3, 4];

io.on("connection", (socket) => {
  // ...
  socket.join(rooms.shift());
});

httpServer.listen(port, () => {
  console.log (`Server running on port ${port}`);
});
