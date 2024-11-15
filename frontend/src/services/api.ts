import { Message } from 'whatsapp-web.js';
import { GetStatusResponse, GetChatsResponse, GetChatMessagesResponse, GetUserResponse } from '../types';

export const api = {
  async getStatus(): Promise<GetStatusResponse> {
    const response = await fetch('/api/status');
    return response.json();
  },

  async getChats(): Promise<GetChatsResponse> {
    const response = await fetch('/api/chats');
    return response.json();
  },

  async getChatMessages(chatId: string): Promise<Message[]> {
    const response = await fetch(`/api/chats/${chatId}/messages`);
    return response.json();
  },

  async sendMessage(chatId: string, message: string): Promise<void> {
    await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
  },

  async getUser(userId: string): Promise<GetUserResponse> {
    const response = await fetch(`/api/user/${userId}`);
    return response.json();
  },

  async logout(): Promise<void> {
    await fetch('/api/logout', {
      method: 'POST',
    });
  },
};
