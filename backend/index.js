
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

let waitingPlayer = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.data.username = username;
    console.log(username + " joined.");
  });

  socket.on("rps-choice", ({ user, choice }) => {
    if (!waitingPlayer) {
      waitingPlayer = { socket, user, choice };
    } else {
      const opponent = waitingPlayer;
      waitingPlayer = null;

      const result = resolveGame(opponent.choice, choice);
      const payload = {
        user1: opponent.user,
        user2: user,
        result
      };
      opponent.socket.emit("rps-result", payload);
      socket.emit("rps-result", payload);
    }
  });

  socket.on("disconnect", () => {
    if (waitingPlayer && waitingPlayer.socket.id === socket.id) {
      waitingPlayer = null;
    }
    console.log("User disconnected:", socket.id);
  });
});

function resolveGame(c1, c2) {
  if (c1 === c2) return "Uafgjort";
  if ((c1 === "rock" && c2 === "scissors") ||
      (c1 === "scissors" && c2 === "paper") ||
      (c1 === "paper" && c2 === "rock")) {
    return "Spiller 1 vinder";
  } else {
    return "Spiller 2 vinder";
  }
}

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
