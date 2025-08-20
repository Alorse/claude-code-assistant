import React, { useEffect, useState } from "react";
import { createHighlighter } from "shiki";

interface ToolUseMessageProps {
  data: any;
}

const ToolUseMessage: React.FC<ToolUseMessageProps> = ({ data }) => {
  const toolInfo = data.toolInfo || data.toolName || "Tool";
  const rawInput = data.rawInput || null;

  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAndHighlight = async (code: string, lang = "javascript") => {
      try {
        const highlighter = await createHighlighter({
          themes: ["nord"],
          langs: [lang],
        });
        // use the bundled helper codeToHtml which operates on the singleton
        const html = highlighter.codeToHtml(code, { lang, theme: "nord" });
        if (!cancelled) setHighlighted(html as string);
      } catch (err) {
        console.error("Shiki highlight failed in ToolUseMessage:", err);
      }
    };

    if (rawInput && typeof rawInput.content === "string") {
      const match = rawInput.content.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || "plaintext";
        const code = match[2];
        loadAndHighlight(code, lang);
        return () => {
          cancelled = true;
        };
      }
    }

    setHighlighted(null);
    return () => {
      cancelled = true;
    };
  }, [rawInput]);

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  return (
    <div className="tool-message p-3 rounded-lg border border-yellow-300 bg-yellow-50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{toolInfo}</div>
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
          {highlighted ? (
            <div
              className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-48"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-48">
              {typeof rawInput.content === "string"
                ? rawInput.content
                : JSON.stringify(rawInput.content, null, 2)}
            </pre>
          )}
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
