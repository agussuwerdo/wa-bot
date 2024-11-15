import { ClientInfo, Chat, Message, Contact, Label } from "whatsapp-web.js";


export interface ClientStatus {
  status: "online" | "offline";
  isConnected: boolean;
  info: ClientInfo | null;
  profilePicUrl: string | null;
};

export interface SocketStatus {
  isConnected: boolean;
};

export interface GetStatusResponse {
  client: ClientStatus;
  socket: SocketStatus;
};

export interface ContactResponse extends Contact {
  profilePicUrl?: string;
}

export interface ChatResponse extends Chat {
  contact?: ContactResponse;
  labels?: Label[];
  messages?: Message[];
};

export interface GetChatsResponse {
  chats: ChatResponse[];
};

export interface UserResponse extends ClientInfo {
  profilePicUrl?: string;
};

export interface GetUserResponse {
  user: UserResponse;
};
