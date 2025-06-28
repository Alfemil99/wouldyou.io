import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com"); // din backend-URL

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;
let soundEnabled = true;

// 🔊 Mute toggle
const muteToggle = document.getElementById("mute-toggle");
muteToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  muteToggle.innerText = soundEnabled ? "🔊" : "🔇";
  stopSounds();
};

// 🔗 Hent første spørgsmål
socket.emit("get-random-question");

socket.on("question-data", (data) => {
  currentQuestionId = data._id || "fail";
  currentChoice = "";
  hasVoted = false;

  // Sæt labels
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;

  // Ryd stemmer & procent
  document.getElementById("red-votes").innerText = "";
  document.getElementById("red-percent").innerText = "";
  document.getElementById("blue-votes").innerText = "";
  document.getElementById("blue-percent").innerText = "";

  // Reset paneler til 50/50
  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;
});

// Klik paneler
document.getElementById("red").onclick = () => handleClick("red");
document.getElementById("blue").onclick = () => handleClick("blue");

function handleClick(choice) {
  if (!hasVoted) {
    vote(choice);
  } else {
    loadNextQuestion();
  }
}

function vote(choice) {
  hasVoted = true;
  currentChoice = choice;
  socket.emit("vote", { questionId: currentQuestionId, choice });
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = total ? Math.round((data.votes_red / total) * 100) : 50;
  const bluePercent = 100 - redPercent;

  // Animate panels
  document.getElementById("red").style.flexGrow = redPercent;
  document.getElementById("blue").style.flexGrow = bluePercent;

  // Update tekst
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("red-votes").innerText = `${data.votes_red} votes`;
  document.getElementById("red-percent").innerText = `${redPercent}%`;

  document.getElementById("blue-label").innerText = data.question_blue;
  document.getElementById("blue-votes").innerText = `${data.votes_blue} votes`;
  document.getElementById("blue-percent").innerText = `${bluePercent}%`;

  // Lyd
  if (soundEnabled) {
    stopSounds();
    const cheer = document.getElementById("cheer-sound");
    const fart = document.getElementById("fart-sound");
    const votedForMajority =
      (currentChoice === "red" && redPercent >= bluePercent) ||
      (currentChoice === "blue" && bluePercent >= redPercent);

    if (votedForMajority) {
      cheer.play().catch(() => {});
    } else {
      fart.play().catch(() => {});
    }
  }
});

function loadNextQuestion() {
  stopSounds();
  hasVoted = false;
  currentChoice = "";
  currentQuestionId = "";

  // Reset panels
  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  // Loading labels
  document.getElementById("red-label").innerText = "Loading...";
  document.getElementById("blue-label").innerText = "Loading...";
  document.getElementById("red-votes").innerText = "";
  document.getElementById("red-percent").innerText = "";
  document.getElementById("blue-votes").innerText = "";
  document.getElementById("blue-percent").innerText = "";

  socket.emit("get-random-question");
}

function stopSounds() {
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause();
  cheer.currentTime = 0;
  fart.pause();
  fart.currentTime = 0;
}
