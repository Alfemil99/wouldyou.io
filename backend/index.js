const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activePlayers = 0;

io.on("connection", (socket) => {
  activePlayers++;
  io.emit("playerCount", activePlayers);
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    activePlayers--;
    io.emit("playerCount", activePlayers);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
