import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

const socket = io("https://v-r-backend.onrender.com");

// Create basic UI
document.body.innerHTML = `
  <header style="padding: 1rem; background: #222; color: white; font-family: sans-serif;">
    <div>🔴 Aktive spillere: <span id="active">0</span></div>
    <div>💾 Simuleret RAM-forbrug: <span id="ram">0</span> MB</div>
  </header>
  <main style="padding: 1rem; font-family: sans-serif;">
    <h2>Velkommen til spillet!</h2>
    <p>Din socket ID: <span id="socketid"></span></p>
  </main>
`;

document.getElementById("socketid").innerText = "Forbinder...";

socket.on("connect", () => {
  document.getElementById("socketid").innerText = socket.id;
});

// Lyt efter opdatering af antal aktive spillere
socket.on("playerCount", (count) => {
  document.getElementById("active").innerText = count;
});

// Simuleret RAM-opdatering
setInterval(() => {
  const simulatedRAM = Math.floor(Math.random() * 100 + 100); // fx 100–200 MB
  document.getElementById("ram").innerText = simulatedRAM;
}, 2000);
