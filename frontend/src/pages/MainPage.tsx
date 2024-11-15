import React, { useState } from "react";
import { MessageInterface } from "../components/MessageInterface";
import { ChatList } from "../components/ChatList";
import { ChatResponse } from "../types";
import { UserInfo } from "../components/UserInfo";
interface MainPageProps {
  chats: ChatResponse[];
  avatar: string;
  name: string;
  status: string;
  onChatSelect: (chatId: string) => Promise<void>;
}

export const MainPage: React.FC<MainPageProps> = ({ chats, avatar, name, status, onChatSelect }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const getSelectedChat = (chatId: string) => {
    return chats.find((chat) => chat.id._serialized === chatId);
  };

  const selectedChat = getSelectedChat(selectedChatId ?? "");
  const selectedChatName = selectedChat?.name;
  const handleChatSelect = async (chatId: string) => {
    console.log("chatId", chatId);
    setSelectedChatId(chatId);
    await onChatSelect(chatId);
  };

  return (
    <div className="h-full flex">
      {/* Chat List */}
      <div className="flex flex-col">
        <UserInfo avatar={avatar} name={name} status={status} />
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Message Interface */}
      <div className="flex-1 h-full">
        {selectedChatId ? (
          <MessageInterface
            name={selectedChatName ?? ""}
            messages={selectedChat?.messages ?? []}
            selectedChatId={selectedChatId}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat to start messaging 💬
          </div>
        )}
      </div>
    </div>
  );
};
