import { Client, LocalAuth } from "whatsapp-web.js";

export class WhatsAppClient {
  private static client: Client | undefined;
  private static isConnected = false;
  private static isLoggedIn = false;

  static async initialize() {
    if (this.client) {
      // If client exists, just return it without re-initializing
      return this.client;
    }

    this.isLoggedIn = false;
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });

    // Remove any existing listeners before adding new ones
    this.client.removeAllListeners();

    this.client.on("qr", (qr) => {
      this.isLoggedIn = false;
      global.io?.emit("qr", qr);
    });

    this.client.on("ready", () => {
      this.isConnected = true;
      this.isLoggedIn = true;
      global.io?.emit("ready");
    });

    this.client.on("authenticated", (session) => {
      this.isLoggedIn = true;
      global.io?.emit("authenticated", session);
    });

    this.client.on("disconnected", () => {
      this.isConnected = false;
      this.isLoggedIn = false;
      global.io?.emit("disconnected");
    });

    this.client.on("auth_failure", (message) => {
      this.isLoggedIn = false;
      global.io?.emit("auth_failure", message);
    });

    this.client.on("message", (message) => {
      if (!message.fromMe) {
        global.io?.emit("message", message);
      }
    });

    this.client.on("message_create", (message) => {
      if (message.fromMe) {
        global.io?.emit("message_create", message);
      }
    });

    this.client.on("loading_screen", (percent, message) => {
      global.io?.emit("loading_screen", { percent, message });
    });

    await this.client.initialize();
    return this.client;
  }

  static getIsConnected() {
    return this.isConnected;
  }

  static getIsLoggedIn() {
    return this.isLoggedIn;
  }

  static getClient() {
    return this.client;
  }

  static async logout() {
    const client = this.getClient();
    if (client) {
      await client.logout();
      // Destroy the current client instance
      this.client = undefined;
      // Emit the logged_out event through the socket
      global.io?.emit("logged_out");
      // Remove the .wwebjs* folders
      const fs = require("fs");
      fs.rmSync(".wwebjs*", { recursive: true, force: true });

      // Reinitialize the client after a longer delay to ensure proper cleanup
      setTimeout(() => {
        this.initialize();
      }, 2000);
    }
  }
}
