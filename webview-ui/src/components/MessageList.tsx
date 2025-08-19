import React from "react";
import LoadingVerb from "./LoadingVerb";
import MessageItem from "./MessageItem";
import { CLAUDE_CODE_COLOR } from "../utils/constants";

interface Message {
  id: string;
  type: "user" | "claude" | "error" | "system";
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  isProcessing?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isProcessing,
}) => {
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
      {isProcessing && (
        <div className="px-2" style={{ color: CLAUDE_CODE_COLOR }}>
          <LoadingVerb running />
        </div>
      )}
    </div>
  );
};

export default MessageList;
