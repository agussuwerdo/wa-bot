import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import { LoginPage } from "./pages/LoginPage";
import { MainPage } from "./pages/MainPage";
import { Message } from "whatsapp-web.js";
import {
  ChatResponse,
  GetStatusResponse,
  ClientStatus,
} from "./types";
import { FaQuestionCircle } from "react-icons/fa";
import { api } from "./services/api";

const socket = io();

const App: React.FC = () => {
  const [status, setStatus] = useState<GetStatusResponse | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatResponse[]>([]);

  const getStatus = async () => {
    const response = await api.getStatus();
    setStatus(response);
  };

  const fetchChats = async () => {
    const response = await api.getChats();
    setChats(response.chats);
  };

  const appendChatMessages = (message: Message) => {
    setChats((prev) => {
      const chatIndex = prev.findIndex((chat) => chat.id._serialized === message.id.remote);
      if (chatIndex !== -1) {
        const updatedChats = [...prev];
        const chat = updatedChats[chatIndex];
        updatedChats[chatIndex] = {
          ...chat,
          messages: [...(chat.messages ?? []), message],
          lastMessage: message,
        };
        return updatedChats;
      }
      return prev;
    });
  };

  const fetchChatMessages = async (chatId: string) => {
    const messages = await api.getChatMessages(chatId);
    const contact = await api.getUser(chatId);
    
    setChats(prev => {
      const chatIndex = prev.findIndex(chat => chat.id._serialized === chatId);
      if (chatIndex !== -1) {
        const updatedChats = [...prev];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: messages,
          contact: {
            ...contact.user,
            profilePicUrl: contact.user.profilePicUrl ?? "",
          },
        };
        return updatedChats;
      }
      return prev;
    });
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setStatus((prev) => ({
        ...prev,
        socket: { connected: true },
        client: prev?.client ?? ({} as ClientStatus),
      }));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setStatus((prev) => ({
        ...prev,
        socket: { connected: false },
        client: prev?.client ?? ({} as ClientStatus),
      }));
    });

    socket.on("qr", (qr: string) => {
      setQrCode(qr);
    });

    socket.on("ready", () => {
      getStatus();
    });

    socket.on("message", (message: Message) => {
      console.log("message", message);
      // Append message to chat
      appendChatMessages(message);
    });

    socket.on("message_create", (message: Message) => {
      console.log("message_create", message);
      // Append message to chat
      appendChatMessages(message);
    });

    socket.on("disconnected", () => {
      // getStatus();
    });

    socket.on("logged_out", () => {
      console.log("logged_out");
      // Clear all states
      setChats([]);
      setQrCode(null);
      // Then fetch new status
      getStatus();
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("qr");
      socket.off("ready");
      socket.off("message");
      socket.off("message_create");
      socket.off("logged_out");
    };
  }, []);

  // useEffect(() => {
  //   const updateContacts = async () => {
  //     // Update contact info for all chats that don't have profile pictures
  //     const chatsToUpdate = chats.filter(chat => !chat.contact?.profilePicUrl);
      
  //     if (chatsToUpdate.length > 0) {
  //       const updatedChatsPromises = chatsToUpdate.map(async (chat) => {
  //         const contact = await api.getUser(chat.id._serialized);
  //         return { ...chat, contact: contact.user };
  //       });

  //       const updatedChats = await Promise.all(updatedChatsPromises);
        
  //       setChats(prev => prev.map(chat => {
  //         const updated = updatedChats.find(u => u.id._serialized === chat.id._serialized);
  //         return updated || chat;
  //       }));
  //     }
  //   }
  //   updateContacts();
  // }, [chats]);

  useEffect(() => {
    getStatus();
  }, []);

  useEffect(() => {
    if (status?.client?.isConnected) {
      fetchChats();
    }
  }, [status]);

  return (
    <div className="h-screen w-screen bg-[#111B21] flex items-center justify-center">
      <div className="w-full h-full bg-white">
        {status?.client?.isConnected === false ? (
          <LoginPage qrCode={qrCode} />
        ) : (
          <MainPage
            chats={chats}
            avatar={status?.client?.profilePicUrl ?? ""}
            name={status?.client?.info?.pushname ?? ""}
            status={status?.client?.status ?? ""}
            onChatSelect={fetchChatMessages}
          />
        )}
      </div>

      {/* Status indicator */}
      <div className="fixed top-4 right-4">
        {/* Add help button with icon */}
        <button className="bg-blue-500 text-white px-2 py-2 rounded-full flex items-center">
          <FaQuestionCircle/>
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
