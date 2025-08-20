import React, { useState, useEffect, useRef } from "react";
import { CLAUDE_CODE_COLOR } from "../utils/constants";

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
  // Syntax highlighting state
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const codeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAndHighlight = async (code: string, lang = "javascript") => {
      try {
        const shiki = await import("shiki");
        const html = await shiki.codeToHtml(code, { lang, theme: "vitesse-dark" });
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
    const baseStyles = "px-2 py-1 rounded-lg relative overflow-hidden";

    switch (message.type) {
      case "user":
        return `${baseStyles} bg-input-background w-[90%] ml-auto border`;
      case "claude":
        return `${baseStyles}`;
      case "error":
        return `${baseStyles} border-red-500/30 bg-red-500/10 border-l-4 border-l-red-500`;
      case "system":
        return `${baseStyles} border-gray-500/20 bg-gray-500/5 border-l-4 border-l-gray-500`;
      case "tool":
        return `text-xs text-description opacity-50`;
      case "tool-result":
        return `${baseStyles} border-indigo-500/20 bg-indigo-500/5 border-l-4 border-l-indigo-500`;
      case "permission-request":
        return `${baseStyles} border-purple-500/20 bg-purple-500/5 border-l-4 border-l-purple-500`;
      default:
        return baseStyles;
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const cleaned = hex.replace('#','');
    const bigint = parseInt(cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getInlineStyle = (): React.CSSProperties | undefined => {
    if (message.type === 'user') {
      return { borderColor: hexToRgba(CLAUDE_CODE_COLOR, 0.4) };
    }
    return undefined;
  };

  return (
    <div className={`group ${getMessageStyles()}`} style={getInlineStyle()}>
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
    </div>
  );
};

export default MessageItem;
