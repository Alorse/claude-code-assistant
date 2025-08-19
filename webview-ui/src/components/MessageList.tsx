import React from "react";
import MessageItem from "./MessageItem";

interface Message {
  id: string;
  type: "user" | "claude" | "error" | "system";
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-description">
          <h3 className="text-lg font-medium text-foreground mb-2">
            <span>
              <span style={{ color: "#DE7356" }}>✻</span> Welcome to Claude Code
              Assistant!
            </span>
          </h3>
          <p className="text-sm">
            /help for help, /status for your current setup, ? for shortcuts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
