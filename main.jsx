
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

const socket = io("https://your-backend-url.onrender.com");

socket.on("connect", () => {
  document.getElementById("root").innerText = "Connected with ID: " + socket.id;
});
