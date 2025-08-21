import React, { useEffect, useState } from "react";
import { renderMarkdown } from "../utils/markdown";
import TodoWriteMessage from "./TodoWriteMessage";
import ExitPlanModeMessage from "./ExitPlanModeMessage";
import MultiEditMessage from "./MultiEditMessage";
import BashMessage from "./BashMessage";

interface ToolUseMessageProps {
  data: any;
}

const ToolUseMessage: React.FC<ToolUseMessageProps> = ({ data }) => {
  const rawInput = data.rawInput || null;

  // Check if this is a TodoWrite tool message
  const isTodoWriteMessage =
    data.toolName === "TodoWrite" || data.toolInfo?.includes("TodoWrite");

  // Check if this is an ExitPlanMode tool message
  const isExitPlanModeMessage =
    data.toolName === "ExitPlanMode" || data.toolInfo?.includes("ExitPlanMode");

  // Check if this is a MultiEdit tool message
  const isMultiEditMessage =
    data.toolName === "MultiEdit" || data.toolInfo?.includes("MultiEdit");

  // Check if this is a Bash tool message
  const isBashMessage =
    data.toolName === "Bash" || data.toolInfo?.includes("Bash");

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

  // If this is a TodoWrite message, use the specialized component
  if (isTodoWriteMessage) {
    return <TodoWriteMessage data={data} />;
  }

  // If this is an ExitPlanMode message, use the specialized component
  if (isExitPlanModeMessage) {
    return <ExitPlanModeMessage data={data} />;
  }

  // If this is a MultiEdit message, use the specialized component
  if (isMultiEditMessage) {
    return <MultiEditMessage data={data} />;
  }

  // If this is a Bash message, use the specialized component
  if (isBashMessage) {
    return <BashMessage data={data} />;
  }

  return (
    <div className="tool-message px-2">
      {rawInput?.file_path && (
        <div className="mb-2 text-xs text-description">
          <div className="font-semibold">
            File:{" "}
            <span className="font-mono break-words">{rawInput.file_path}</span>
          </div>
        </div>
      )}

      {rawInput?.content && (
        <div className="mb-2">
          <div className="font-semibold text-xs">Content:</div>
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
