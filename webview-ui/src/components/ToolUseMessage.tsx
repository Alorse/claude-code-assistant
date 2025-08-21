import React, { useEffect, useState } from "react";
import { renderMarkdown } from "../utils/markdown";
import TodoWriteMessage from "./TodoWriteMessage";

interface ToolUseMessageProps {
  data: any;
}

const ToolUseMessage: React.FC<ToolUseMessageProps> = ({ data }) => {
  const toolInfo = data.toolInfo || data.toolName || "Tool";
  const rawInput = data.rawInput || null;

  // Check if this is a TodoWrite tool message
  const isTodoWriteMessage =
    data.toolName === "TodoWrite" || data.toolInfo?.includes("TodoWrite");

  const [renderedContent, setRenderedContent] = useState<string | null>(null);

  useEffect(() => {
    if (rawInput && typeof rawInput.content === "string") {
      try {
        const html = renderMarkdown(rawInput.content);
        setRenderedContent(html);
      } catch (err) {
        console.error("Markdown rendering failed in ToolUseMessage:", err);
        setRenderedContent(null);
      }
    } else {
      setRenderedContent(null);
    }
  }, [rawInput]);

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  // If this is a TodoWrite message, use the specialized component
  if (isTodoWriteMessage) {
    return <TodoWriteMessage data={data} />;
  }

  return (
    <div className="tool-message px-2 py-1">
      <div className="flex items-center justify-between">
        <div className="text-xs">{toolInfo}</div>
        <div className="flex gap-2">
          {rawInput?.content && typeof rawInput.content === "string" && (
            <button
              className="btn text-xs"
              onClick={() => copyContent(rawInput.content)}
              title="Copy content"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {rawInput?.file_path && (
        <div className="mb-2 text-xs text-description">
          <div className="font-semibold">File</div>
          <div className="font-mono break-words">{rawInput.file_path}</div>
        </div>
      )}

      {rawInput?.content && (
        <div className="mb-2">
          <div className="font-semibold text-sm">Content</div>
          {renderedContent ? (
            <div
              className="mt-1 p-2 rounded border border-border text-xs overflow-auto max-h-48 markdown-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          ) : (
            <pre className="mt-1 p-2 rounded border border-border text-xs overflow-auto max-h-48">
              {typeof rawInput.content === "string"
                ? rawInput.content
                : JSON.stringify(rawInput.content, null, 2)}
            </pre>
          )}
        </div>
      )}

      {!rawInput && data.toolInput && (
        <pre className="mt-1 p-2 rounded border border-border text-xs overflow-auto max-h-48">
          {typeof data.toolInput === "string"
            ? data.toolInput
            : JSON.stringify(data.toolInput, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ToolUseMessage;
