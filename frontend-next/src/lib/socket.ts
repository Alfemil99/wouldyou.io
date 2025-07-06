import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://v-r-backend.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
