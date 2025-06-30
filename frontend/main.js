import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

const socket = io("https://v-r-backend.onrender.com"); // Din backend URL

let activeCategory = null;
let activePollId = null;

// === Parse URL på load ===
window.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.startsWith("/poll/")) {
    const pollId = path.split("/poll/")[1];
    console.log(`🔗 Opening specific poll by ID: ${pollId}`);
    socket.emit("get-poll-by-id", { pollId });
    document.getElementById("categories").style.display = "none";
    document.getElementById("poll").style.display = "flex";
  }
});

// === Go Home ===
window.goHome = function() {
  document.getElementById("categories").style.display = "grid";
  document.getElementById("poll").style.display = "none";
  document.getElementById("poll").innerHTML = "";
  document.body.classList.remove('voted');
  window.history.pushState(null, "", `/`);
  activeCategory = null;
  activePollId = null;
  console.log("🏠 Back to home");
};

// === Select category & get random poll ===
window.selectCategory = function(category) {
  console.log("🔄 Loading poll for category:", category);

  activeCategory = category;

  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "flex";

  socket.emit("get-random-poll", { category: category });
};

// === Receive poll ===
socket.on("poll-data", (poll) => {
  const pollDiv = document.getElementById("poll");

  if (!poll) {
    pollDiv.innerHTML = `
      <p>No polls found.</p>
      <button onclick='goHome()'>Back</button>
    `;
    return;
  }

  console.log("📥 Loaded poll-data:", poll);
  activePollId = poll._id;

  // Opdater URL til delbart link
  window.history.pushState(null, "", `/poll/${activePollId}`);

  pollDiv.innerHTML = `
    <h2>${poll.question_text}</h2>
    ${poll.options.map((opt, idx) => `
      <button class="poll-option" id="option-${idx}" onclick="vote(${idx})">
        <div class="progress-fill"></div>
        <span>${opt.text}</span>
      </button>
    `).join("")}

    <div class="poll-actions">
      <button class="poll-button" onclick="copyLink()">🔗 Share Poll</button>
      <button class="poll-button" onclick="nextPoll()">Next</button>
      <button class="poll-button" onclick="goHome()">Back</button>
    </div>
  `;

  document.body.classList.remove('voted');
});

// === Vote ===
window.vote = function(optionIndex) {
  if (!activePollId) return;
  console.log(`🗳️ Voting: ${activePollId} | option ${optionIndex}`);
  socket.emit("vote", { pollId: activePollId, optionIndex });
};

// === Receive vote result ===
socket.on("vote-result", (result) => {
  if (result.error) {
    console.error("❌ Vote error:", result.error);
    return;
  }

  console.log("📊 Vote-result:", result);

  const totalVotes = result.options.reduce((sum, opt) => sum + opt.votes, 0);

  result.options.forEach((opt, idx) => {
    const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
    const fill = document.querySelector(`#option-${idx} .progress-fill`);
    const label = document.querySelector(`#option-${idx} span`);

    if (fill) fill.style.width = percent + "%";
    if (label) label.innerText = `${opt.text}: ${percent}% (${opt.votes} votes)`;
  });

  document.body.classList.add('voted');
});

// === Next Poll ===
window.nextPoll = function() {
  if (!activeCategory) return;
  document.body.classList.remove('voted');
  socket.emit("get-random-poll", { category: activeCategory });
};

// === Copy Share Link ===
window.copyLink = function() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("✅ Poll link copied to clipboard!");
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
  });
};
