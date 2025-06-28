
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

const questionId = "q1";
let hasVoted = false;

socket.emit("get-question", questionId);

socket.on("question-data", (data) => {
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;
});

document.getElementById("red").onclick = () => vote("red");
document.getElementById("blue").onclick = () => vote("blue");

function vote(choice) {
  if (hasVoted) return;
  hasVoted = true;
  socket.emit("vote", { questionId, choice });
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  // Animate panels
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

  // Tjek om bruger valgte flertal
  let votedForMajority = false;
  if (choice === "red") {
    votedForMajority = redPercent >= bluePercent;
  } else {
    votedForMajority = bluePercent >= redPercent;
  }

  // Spil lyd
  if (votedForMajority) {
    document.getElementById("cheer-sound").play();
  } else {
    document.getElementById("fart-sound").play();
  }
});

