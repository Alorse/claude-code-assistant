import React, { useState, useEffect } from "react";
import { CLAUDE_CODE_COLOR } from "../utils/constants";
import SystemReminderToggle from "./SystemReminderToggle";
import { renderMarkdown } from "../utils/markdown";

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
  // Rendered markdown content
  const [renderedContent, setRenderedContent] = useState<string | null>(null);

  // Extract system reminders from string content (for user messages)
  let strippedContent: string | null = null;
  const reminders: string[] = [];
  if (typeof message.content === "string") {
    const systemReminderRegex =
      /<system-reminder>([\s\S]*?)<\/system-reminder>/g;
    strippedContent = message.content.replace(systemReminderRegex, (_m, g1) => {
      reminders.push((g1 || "").trim());
      return "";
    });
  }

  useEffect(() => {
    // Process markdown content
    const contentToProcess =
      typeof strippedContent === "string"
        ? strippedContent
        : typeof message.content === "string"
          ? message.content
          : null;

    if (contentToProcess) {
      try {
        const html = renderMarkdown(contentToProcess);
        setRenderedContent(html);
      } catch (err) {
        console.error("Markdown rendering failed:", err);
        setRenderedContent(null);
      }
    } else {
      setRenderedContent(null);
    }
  }, [message.content, strippedContent]);

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
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getInlineStyle = (): React.CSSProperties | undefined => {
    if (message.type === "user") {
      return {
        boxShadow: `0 0 10px 0.1px ${hexToRgba(CLAUDE_CODE_COLOR, 0.4)}`,
      };
    }
    return undefined;
  };

  return (
    <div className={`group ${getMessageStyles()}`} style={getInlineStyle()}>
      <div className="text-sm leading-relaxed break-words">
        {renderedContent ? (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        ) : React.isValidElement(message.content) ? (
          message.content
        ) : typeof strippedContent === "string" ||
          typeof message.content === "string" ||
          typeof message.content === "number" ? (
          // prefer strippedContent (without system reminders) when available - apply markdown-content for consistent styling
          <div className="markdown-content whitespace-pre-wrap">
            {strippedContent ?? message.content}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(message.content, null, 2)}
          </pre>
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
