import React from "react";

interface ToolUseMessageProps {
  data: any;
}

const ToolUseMessage: React.FC<ToolUseMessageProps> = ({ data }) => {
  console.log("ToolUseMessage", data);
  const toolInfo = data.toolInfo || data.toolName || "Tool";
  const rawInput = data.rawInput || null;

  return (
    <div className="tool-message p-3 rounded-lg border border-yellow-300 bg-yellow-50">
      <div className="text-sm font-medium mb-2">{toolInfo}</div>

      {rawInput?.file_path && (
        <div className="mb-2 text-xs text-description">
          <div className="font-semibold">File</div>
          <div className="font-mono break-words">{rawInput.file_path}</div>
        </div>
      )}

      {rawInput?.content && (
        <div className="mb-2">
          <div className="font-semibold text-sm">Content</div>
          <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-48">
            {rawInput.content}
          </pre>
        </div>
      )}

      {!rawInput && data.toolInput && (
        <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-48">
          {typeof data.toolInput === "string"
            ? data.toolInput
            : JSON.stringify(data.toolInput, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ToolUseMessage;
