import React, { useState, useEffect, useRef } from "react";
import { createHighlighter } from "shiki";

interface Message {
  id: string;
  type:
    | "user"
    | "claude"
    | "error"
    | "system"
    | "tool"
    | "tool-result"
    | "permission-request";
  content: any;
  timestamp: string;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const text =
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  // Syntax highlighting state
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const codeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAndHighlight = async (code: string, lang = "javascript") => {
      try {
        const highlighter = await createHighlighter({
          themes: ["vitesse-dark"],
          langs: [lang],
        });
        // use the bundled helper codeToHtml which operates on the singleton
        const html = highlighter.codeToHtml(code, { lang, theme: "vitesse-dark" });
        if (!cancelled) setHighlighted(html as string);
      } catch (err) {
        console.error("Shiki highlight failed:", err);
      }
    };

    // Detect code block strings: triple-backtick fences
    if (typeof message.content === "string") {
      const match = message.content.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || "plaintext";
        const code = match[2];
        loadAndHighlight(code, lang);
      } else {
        setHighlighted(null);
      }
    } else {
      setHighlighted(null);
    }

    return () => {
      cancelled = true;
    };
  }, [message.content]);

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
      case "tool":
        return `${baseStyles} border-yellow-500/20 bg-yellow-500/5 border-l-4 border-l-yellow-500`;
      case "tool-result":
        return `${baseStyles} border-indigo-500/20 bg-indigo-500/5 border-l-4 border-l-indigo-500`;
      case "permission-request":
        return `${baseStyles} border-purple-500/20 bg-purple-500/5 border-l-4 border-l-purple-500`;
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
      case "tool":
        return `${baseStyles} bg-gradient-to-br from-yellow-500 to-yellow-600`;
      case "tool-result":
        return `${baseStyles} bg-gradient-to-br from-indigo-500 to-indigo-600`;
      case "permission-request":
        return `${baseStyles} bg-gradient-to-br from-purple-500 to-purple-600`;
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
      case "tool":
        return "T";
      case "tool-result":
        return "R";
      case "permission-request":
        return "P";
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
      case "tool":
        return "Tool";
      case "tool-result":
        return "Tool Result";
      case "permission-request":
        return "Permission";
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
        {highlighted ? (
          <div
            ref={codeRef}
            className="code-block"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : React.isValidElement(message.content) ? (
          message.content
        ) : typeof message.content === "string" || typeof message.content === "number" ? (
          message.content
        ) : (
          <pre className="whitespace-pre-wrap">{JSON.stringify(message.content, null, 2)}</pre>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-xs text-description opacity-50 mt-2">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageItem;
