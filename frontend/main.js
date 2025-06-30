// === main.js ===

import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

// ✅ Socket.IO connection
const socket = io("https://v-r-backend.onrender.com"); // Din backend URL

let activeCategory = null;
let activePollId = null;

// === Go back to landing page ===
window.goHome = function() {
  document.getElementById("categories").style.display = "grid";
  document.getElementById("poll").style.display = "none";
  document.getElementById("poll").innerHTML = "";
  document.body.classList.remove('voted');
  activeCategory = null;
  activePollId = null;

  console.log("🏠 Back to home");
};

// === Select category & get random poll ===
window.selectCategory = function(category) {
  console.log("🔄 Loading poll for category:", category);

  activeCategory = category;

  // Toggle views
  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "flex";

  socket.emit("get-random-poll", { category: category });
};

// === Receive poll ===
socket.on("poll-data", (poll) => {
  const pollDiv = document.getElementById("poll");

  if (!poll) {
    pollDiv.innerHTML = `
      <p>No polls found for this category.</p>
      <button onclick='goHome()'>Back</button>
    `;
    return;
  }

  console.log("📥 Received poll-data:", poll);
  activePollId = poll._id;

  pollDiv.innerHTML = `
    <h2>${poll.question_text}</h2>
    ${poll.options.map((opt, idx) => `
      <button class="poll-option" id="option-${idx}" onclick="vote(${idx})">
        <div class="progress-fill"></div>
        <span>${opt.text}</span>
      </button>
    `).join("")}
    <button onclick="nextPoll()">Next</button>
    <button onclick="goHome()">Back</button>
  `;

  document.body.classList.remove('voted');
});

// === Vote ===
window.vote = function(optionIndex) {
  if (!activePollId) return;
  console.log(`🗳️ Emitting vote with pollId: ${activePollId} | optionIndex: ${optionIndex}`);
  socket.emit("vote", { pollId: activePollId, optionIndex });
};

// === Receive vote result ===
socket.on("vote-result", (result) => {
  if (result.error) {
    console.error("❌ Vote error:", result.error);
    return;
  }

  console.log("📊 Received vote-result:", result);

  const totalVotes = result.options.reduce((sum, opt) => sum + opt.votes, 0);

  result.options.forEach((opt, idx) => {
    const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;

    const fill = document.querySelector(`#option-${idx} .progress-fill`);
    const label = document.querySelector(`#option-${idx} span`);

    if (fill) fill.style.width = percent + "%";
    if (label) label.innerText = `${opt.text}: ${percent}% (${opt.votes} votes)`;
  });

  // Prevent hover effect on voted buttons
  document.body.classList.add('voted');
});

// === Next Poll ===
window.nextPoll = function() {
  if (!activeCategory) return;
  console.log(`🔄 Next poll for category: ${activeCategory}`);
  document.body.classList.remove('voted');
  socket.emit("get-random-poll", { category: activeCategory });
};
