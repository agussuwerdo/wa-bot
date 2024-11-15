import express from "express";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
import http from "http";
import { WhatsAppClient } from "./services/whatsappClient";
import { initializeWebSocket } from "./websocket/socket";
import chatsRouter from "./routes/chats";
import statusRouter from "./routes/status";
import userRouter from "./routes/user";
import { routeLogger } from "./middleware/routeLogger";
import { checkClientLoggedIn } from "./middleware/clientConnection";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Initialize WhatsApp Client
WhatsAppClient.initialize();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/chats", routeLogger, checkClientLoggedIn, chatsRouter);
app.use("/api/user", routeLogger, checkClientLoggedIn, userRouter);
app.use("/api/status", routeLogger, statusRouter);
app.post("/api/logout", async (_, res) => {
  await WhatsAppClient.logout();
  res.sendStatus(200);
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
