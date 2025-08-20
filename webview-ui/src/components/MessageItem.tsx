import React, { useState, useEffect, useRef } from "react";
import { CLAUDE_CODE_COLOR } from "../utils/constants";
import SystemReminderToggle from "./SystemReminderToggle";

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

  // Extract system reminders from string content (for user messages)
  let strippedContent: string | null = null;
  const reminders: string[] = [];
  if (typeof message.content === "string") {
    const systemReminderRegex = /<system-reminder>([\s\S]*?)<\/system-reminder>/g;
    strippedContent = message.content.replace(systemReminderRegex, (_m, g1) => {
      reminders.push((g1 || "").trim());
      return "";
    });
  }

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
    const contentToCheck = typeof strippedContent === "string" ? strippedContent : (typeof message.content === "string" ? message.content : null);
    if (contentToCheck) {
      const match = contentToCheck.match(/```(\w+)?\n([\s\S]*?)```/);
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
        return `${baseStyles} bg-input-background w-[90%] ml-auto`;
      case "claude":
        return `${baseStyles}`;
      case "error":
        return `${baseStyles} bg-red-500/10`;
      case "system":
        return `${baseStyles} bg-gray-500/5`;
      case "tool":
        return `text-xs text-description opacity-50`;
      case "tool-result":
        return `${baseStyles} bg-indigo-500/5`;
      case "permission-request":
        return `${baseStyles} bg-purple-500/5 border-l-4 border-l-purple-500`;
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
      return { 
        boxShadow: `0 0 10px 0.1px ${hexToRgba(CLAUDE_CODE_COLOR, 0.4)}`
       };
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
        ) : typeof strippedContent === "string" || typeof message.content === "string" || typeof message.content === "number" ? (
          // prefer strippedContent (without system reminders) when available
          (strippedContent ?? message.content)
        ) : (
          <pre className="whitespace-pre-wrap">{JSON.stringify(message.content, null, 2)}</pre>
        )}
      </div>
      {reminders.length > 0 && (
        <div className="mt-2">
          {reminders.map((r, idx) => (
            <div key={idx} className="mt-2">
              {/* collapsed by default via SystemReminderToggle component */}
              <SystemReminderToggle content={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
