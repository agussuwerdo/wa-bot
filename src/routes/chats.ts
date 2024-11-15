import { Router } from "express";
import { WhatsAppClient } from "../services/whatsappClient";
import { GetChatsResponse } from "../types";
import { Chat, Message } from "whatsapp-web.js";

const router = Router();

router.get("/", async (req, res) => {
  const client = WhatsAppClient.getClient();
  if (!client) {
    res.status(500).json({ message: "WhatsApp client not initialized" });
    return;
  }
  const chats: Chat[] = await client.getChats();
  const response: GetChatsResponse = {
    chats,
  };
  res.json(response);
});

router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const client = WhatsAppClient.getClient();
    if (!client) {
      res.status(500).json({ message: "WhatsApp client not initialized" });
      return;
    }
    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 50 });
    res.json(
      messages.map((msg) => ({
        id: msg.id._serialized,
        body: msg.body,
        timestamp: msg.timestamp,
        from: msg.from,
        to: msg.to,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
});

router.get("/:chatId/messages", async (req, res) => {
  const client = WhatsAppClient.getClient();
  if (!client) {
    res.status(500).json({ message: "WhatsApp client not initialized" });
    return;
  }
  const { chatId } = req.params;
  const messages: Message[] = await (await client
    .getChatById(chatId))
    .fetchMessages({ limit: 50 });
  res.json(messages);
});

router.post("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    if (!chatId || !message) {
      res.status(400).json({ message: "ChatId and message are required" });
      return;
    }
    const client = WhatsAppClient.getClient();
    console.log("client", client);

    if (!client) {
      res.status(500).json({ message: "WhatsApp client not initialized" });
      return;
    }
    const result = await client.sendMessage(chatId, message);
    res.json({
      success: true,
      messageId: result.id.id,
      timestamp: result.timestamp,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
