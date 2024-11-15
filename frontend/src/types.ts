import { Chat, ClientInfo, Contact, Label, Message } from "whatsapp-web.js";

export interface ChatStatus {
  connected: boolean;
  qrCode?: string;
}

export interface ClientStatus {
  status: "online" | "offline";
  isConnected: boolean;
  info: ClientInfo | null;
  profilePicUrl: string | null;
}

export interface SocketStatus {
  connected: boolean;
}

export interface GetStatusResponse {
  client: ClientStatus;
  socket: SocketStatus;
}

export interface ContactResponse extends Contact {
  profilePicUrl?: string;
}

export interface ChatResponse extends Chat {
  messages?: Message[];
  contact?: ContactResponse;
  labels?: Label[];
}

export interface GetChatsResponse {
  chats: ChatResponse[];
}

export interface GetChatMessagesResponse {
  messages: Message[];
}

export interface GetUserResponse {
  user: ContactResponse;
}
