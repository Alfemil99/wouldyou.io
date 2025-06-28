
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let currentChoice = "";
let hasVoted = false;

// Første load
socket.emit("get-random-question");

socket.on("question-data", (data) => {
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;
});

document.getElementById("red").onclick = () => vote("red");
document.getElementById("blue").onclick = () => vote("blue");

function vote(choice) {
  if (hasVoted) return;
  hasVoted = true;
  currentChoice = choice;
  socket.emit("vote", { questionId: "q1", choice }); // questionId bruges stadig som dummy
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  document.getElementById("red").style.height = redPercent + "%";
  document.getElementById("blue").style.height = bluePercent + "%";

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

  // Lyd
  let votedForMajority = false;
  if (currentChoice === "red") {
    votedForMajority = redPercent >= bluePercent;
  } else {
    votedForMajority = bluePercent >= redPercent;
  }

  if (votedForMajority) {
    document.getElementById("cheer-sound").play();
  } else {
    document.getElementById("fart-sound").play();
  }

  document.getElementById("next-btn").style.display = "block";
});

document.getElementById("next-btn").onclick = () => {
  hasVoted = false;
  currentChoice = "";
  document.getElementById("next-btn").style.display = "none";

  socket.emit("get-random-question");

  document.getElementById("red").style.height = "50%";
  document.getElementById("blue").style.height = "50%";
  document.getElementById("red").innerHTML = "<div>Loading...</div>";
  document.getElementById("blue").innerHTML = "<div>Loading...</div>";
};
