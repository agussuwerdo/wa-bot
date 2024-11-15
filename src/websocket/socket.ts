import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WhatsAppClient } from "../services/whatsappClient";
import { socketLogger } from "../middleware/socketLogger";

declare global {
  var io: Server | undefined;
}

let isConnected = false;

export const initializeWebSocket = async (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Make io globally available
  global.io = io;

  // Add the logger middleware
  io.use(socketLogger);

  io.on("connection", (socket) => {
    isConnected = true;

    socket.on("disconnect", () => {
      isConnected = false;
    });
  });

  return io;
};

export const getSocketStatus = () => {
  return {
    isConnected,
  };
};