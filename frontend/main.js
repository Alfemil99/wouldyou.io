import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com"); // din backend

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;
let soundEnabled = true;

// 🎚️ Mute toggle
const muteToggle = document.getElementById("mute-toggle");
muteToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  muteToggle.innerText = soundEnabled ? "🔊" : "🔇";

  // Stop evt. lyd straks
  stopSounds();
};

// 🔗 Hent første spørgsmål
socket.emit("get-random-question");

socket.on("question-data", (data) => {
  currentQuestionId = data._id || "fail";
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;

  // Reset panels til 50/50
  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  hasVoted = false;
  currentChoice = "";
});

// 🔴 Klik paneler
document.getElementById("red").onclick = () => handleClick("red");
document.getElementById("blue").onclick = () => handleClick("blue");

function handleClick(choice) {
  if (!hasVoted) {
    vote(choice);
  } else {
    loadNextQuestion();
  }
}

// ✅ Stem
function vote(choice) {
  hasVoted = true;
  currentChoice = choice;
  socket.emit("vote", { questionId: currentQuestionId, choice });
}

// 🔄 Modtag resultat
socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  // Animate panels
  document.getElementById("red").style.flexGrow = redPercent;
  document.getElementById("blue").style.flexGrow = bluePercent;

  document.getElementById("red").innerHTML = `
    <div>${data.question_red}</div>
    <div>${data.votes_red} votes</div>
    <div>${redPercent}%</div>
  `;
  document.getElementById("blue").innerHTML = `
    <div>${data.question_blue}</div>
    <div>${data.votes_blue} votes</div>
    <div>${bluePercent}%</div>
  `;

  // Lyd afhængigt af valg
  if (soundEnabled) {
    const cheer = document.getElementById("cheer-sound");
    const fart = document.getElementById("fart-sound");
    const votedForMajority = (currentChoice === "red" && redPercent >= bluePercent)
                          || (currentChoice === "blue" && bluePercent >= redPercent);

    stopSounds();
    if (votedForMajority) {
      cheer.play().catch(() => {});
    } else {
      fart.play().catch(() => {});
    }
  }
});

// 🔄 Load næste spørgsmål
function loadNextQuestion() {
  stopSounds();
  hasVoted = false;
  currentChoice = "";
  currentQuestionId = "";

  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  document.getElementById("red").innerHTML = "<div id='red-label'>Loading...</div>";
  document.getElementById("blue").innerHTML = "<div id='blue-label'>Loading...</div>";

  socket.emit("get-random-question");
}

// 🛑 Stop alle lyde
function stopSounds() {
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause();
  cheer.currentTime = 0;
  fart.pause();
  fart.currentTime = 0;
}
