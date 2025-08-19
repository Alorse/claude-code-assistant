import React, { useState } from "react";

interface Message {
  id: string;
  type: "user" | "claude" | "error" | "system";
  content: string;
  timestamp: string;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const getMessageStyles = () => {
    const baseStyles = "p-3 rounded-lg border relative overflow-hidden";

    switch (message.type) {
      case "user":
        return `${baseStyles} border-blue-500/20 bg-blue-500/5 border-l-4 border-l-blue-500`;
      case "claude":
        return `${baseStyles} border-green-500/20 bg-green-500/5 border-l-4 border-l-green-500`;
      case "error":
        return `${baseStyles} border-red-500/30 bg-red-500/10 border-l-4 border-l-red-500`;
      case "system":
        return `${baseStyles} border-gray-500/20 bg-gray-500/5 border-l-4 border-l-gray-500`;
      default:
        return baseStyles;
    }
  };

  const getIconStyles = () => {
    const baseStyles =
      "w-5 h-5 rounded flex items-center justify-center text-xs font-semibold text-white flex-shrink-0";

    switch (message.type) {
      case "user":
        return `${baseStyles} bg-gradient-to-br from-blue-500 to-blue-600`;
      case "claude":
        return `${baseStyles} bg-gradient-to-br from-green-500 to-green-600`;
      case "error":
        return `${baseStyles} bg-gradient-to-br from-red-500 to-red-600`;
      case "system":
        return `${baseStyles} bg-gradient-to-br from-gray-500 to-gray-600`;
      default:
        return baseStyles;
    }
  };

  const getIconText = () => {
    switch (message.type) {
      case "user":
        return "U";
      case "claude":
        return "C";
      case "error":
        return "E";
      case "system":
        return "S";
      default:
        return "?";
    }
  };

  const getLabel = () => {
    switch (message.type) {
      case "user":
        return "You";
      case "claude":
        return "Claude";
      case "error":
        return "Error";
      case "system":
        return "System";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={`group ${getMessageStyles()}`}>
      {/* Message Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
        <div className={getIconStyles()}>{getIconText()}</div>

        <span className="text-xs font-medium uppercase tracking-wide opacity-80">
          {getLabel()}
        </span>

        <button
          onClick={copyToClipboard}
          className="ml-auto opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-xs"
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? "✓" : "📋"}
        </button>
      </div>

      {/* Message Content */}
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </div>

      {/* Timestamp */}
      <div className="text-xs text-description opacity-50 mt-2">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageItem;
