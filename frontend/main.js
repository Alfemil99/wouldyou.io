import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com"); // Din backend URL

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;
let soundEnabled = true;

// 🎚️ Mute toggle
document.getElementById("mute-toggle").onclick = () => {
  soundEnabled = !soundEnabled;
  document.getElementById("mute-toggle").innerText = soundEnabled ? "🔊" : "🔇";

  // Stop evt. lyd straks
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause();
  cheer.currentTime = 0;
  fart.pause();
  fart.currentTime = 0;
};

// 🔄 Hent første spørgsmål
socket.emit("get-random-question");

// 🟢 Modtag spørgsmål
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

// ✅ Send stemme
function vote(choice) {
  hasVoted = true;
  currentChoice = choice;
  socket.emit("vote", { questionId: currentQuestionId, choice });
}

// 🟢 Modtag resultat
socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  // Animate panels snappy!
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

  // 🔊 Lyd afhænger af toggle
  if (soundEnabled) {
    const cheer = document.getElementById("cheer-sound");
    const fart = document.getElementById("fart-sound");

    let votedForMajority = false;
    if (currentChoice === "red") {
      votedForMajority = redPercent >= bluePercent;
    } else {
      votedForMajority = bluePercent >= redPercent;
    }

    if (votedForMajority) {
      cheer.currentTime = 0;
      cheer.play().catch(() => {});
    } else {
      fart.currentTime = 0;
      fart.play().catch(() => {});
    }
  }
});

// 🔄 Næste spørgsmål
function loadNextQuestion() {
  // Stop lyd straks
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause();
  cheer.currentTime = 0;
  fart.pause();
  fart.currentTime = 0;

  hasVoted = false;
  currentChoice = "";
  currentQuestionId = "";

  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  document.getElementById("red").innerHTML = "<div id='red-label'>Loading...</div>";
  document.getElementById("blue").innerHTML = "<div id='blue-label'>Loading...</div>";

  socket.emit("get-random-question");
}
