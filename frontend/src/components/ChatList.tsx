import React from 'react';
import { ChatResponse } from '../types';
import { formatTimestamp } from '../utils/formatTimestamp';

interface ChatListProps {
  chats: ChatResponse[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
  return (
    <div className="w-[350px] h-full border-r border-gray-200 bg-white overflow-y-auto">
      {chats.map((chat) => {
        const lastMessage = chat.lastMessage;
        return (
          <div
            key={`${chat.id._serialized}-${chat.name}`}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
              selectedChatId === chat.id._serialized ? 'bg-gray-100' : ''
            }`}
            onClick={() => onChatSelect(chat.id._serialized)}
          >
            {/* Chat Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0">
              {chat.contact?.profilePicUrl && (
                <img
                  src={chat.contact.profilePicUrl}
                  alt={chat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            
            {/* Chat Info */}
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                {lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(lastMessage.timestamp)}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {lastMessage.body}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 