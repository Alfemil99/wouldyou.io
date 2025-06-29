// === Socket.IO ESM client ===
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

// === State ===
let currentCategory = null;

// === Selectors ===
const categorySelector = document.getElementById("category-selector");
const pollContainer = document.getElementById("poll-container");
const nextBtn = document.getElementById("next-btn");

// === Category selected ===
window.selectCategory = function (category) {
  currentCategory = category;
  categorySelector.style.display = "none";
  pollContainer.style.display = "flex";
  loadPoll();
};

// === Load a poll for the current category ===
function loadPoll() {
  socket.emit("get-random-poll", { category: currentCategory });
  nextBtn.style.display = "none";
}

// === Receive poll data ===
socket.on("poll-data", (poll) => {
  if (!poll) {
    pollContainer.innerHTML = "<p>No polls available for this category.</p>";
    return;
  }

  pollContainer.innerHTML = ""; // Clear old poll

  const question = document.createElement("div");
  question.classList.add("poll-question");
  question.innerText = poll.question_text;
  pollContainer.appendChild(question);

  poll.options.forEach((opt, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("poll-option");
    optionDiv.innerText = opt.text;

    optionDiv.onclick = () => {
      socket.emit("vote", { pollId: poll._id, optionIndex: index });
    };

    pollContainer.appendChild(optionDiv);
  });
});

// === Receive vote result ===
socket.on("vote-result", (poll) => {
  const options = pollContainer.querySelectorAll(".poll-option");
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  poll.options.forEach((opt, index) => {
    const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
    options[index].innerText = `${opt.text} — ${percent}%`;
    options[index].style.background = `linear-gradient(90deg, #3b53db ${percent}%, #333 ${percent}%)`;
  });

  nextBtn.style.display = "inline-block";
});

// === Next Poll click ===
nextBtn.onclick = () => {
  loadPoll();
};
