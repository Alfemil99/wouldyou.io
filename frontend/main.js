
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let username = null;

const emojis = ["🐵", "🧠", "💀", "😈", "👺", "🥷", "🗿"];
document.body.innerHTML = `
  <header style="padding: 1rem; background: #222; color: white; font-family: sans-serif;">
    <div>🧑 Spiller: <span id="user">Venter...</span></div>
    <div>🪨✂️📄 Valg: 
      <button onclick="choose('rock')">🪨</button>
      <button onclick="choose('scissors')">✂️</button>
      <button onclick="choose('paper')">📄</button>
    </div>
    <div id="game-status" style="margin-top: 1rem;"></div>
  </header>
  <main style="padding: 1rem; font-family: sans-serif;">
    <h2>Vælg din emoji-identitet:</h2>
    <div id="emoji-select"></div>
  </main>
`;

// Emoji login
const emojiContainer = document.getElementById("emoji-select");
emojis.forEach(e => {
  const btn = document.createElement("button");
  btn.innerText = e;
  btn.style.fontSize = "2rem";
  btn.onclick = () => {
    username = e;
    document.getElementById("user").innerText = username;
    emojiContainer.remove();
    socket.emit("join", username);
  };
  emojiContainer.appendChild(btn);
});

// Vælg handling
window.choose = (choice) => {
  if (!username) return alert("Vælg en emoji først!");
  socket.emit("rps-choice", { user: username, choice });
};

// Vis resultat
socket.on("rps-result", (data) => {
  const status = document.getElementById("game-status");
  status.innerText = `🆚 ${data.user1} vs ${data.user2} → ${data.result}`;
});
