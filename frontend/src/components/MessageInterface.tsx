import React, { useEffect, useRef, useState } from "react";
import { Message } from "whatsapp-web.js";
import { api } from "../services/api";
import { formatTimestamp } from "../utils/formatTimestamp";

interface MessageInterfaceProps {
  name: string;
  messages: Message[];
  selectedChatId: string | null;
}

export const MessageInterface: React.FC<MessageInterfaceProps> = ({
  name,
  messages,
  selectedChatId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const isChatChanged = previousChatIdRef.current !== selectedChatId;
    if (isChatChanged) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousChatIdRef.current = selectedChatId;
  }, [messages, selectedChatId]);

  const handleSendMessage = async () => {
    if (selectedChatId && inputValue.trim()) {
      try {
        await api.sendMessage(selectedChatId, inputValue);
        setInputValue("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#075E54] text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold">{name}</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-[#E5DDD5] overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message) => (
            <div
              key={`${message.id._serialized}-${message.id.id}`}
              className={`flex ${
                message.id.fromMe ? "justify-end" : "justify-start"
              } px-4 py-2`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                  message.id.fromMe ? "bg-[#DCF8C6]" : "bg-white"
                }`}
              >
                <p className="text-gray-800">{message.body}</p>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {formatTimestamp(message.timestamp, true)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[#F0F2F5] p-4">
        <div className="flex gap-2">
          <textarea
            placeholder="Type a message"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#075E54] resize-none overflow-hidden"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "150px" }}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#075E54] text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-[#054c44]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
