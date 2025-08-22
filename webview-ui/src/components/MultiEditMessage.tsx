import React from "react";

interface Edit {
  old_string: string;
  new_string: string;
}

interface MultiEditMessageProps {
  data: {
    toolInfo?: string;
    toolName?: string;
    rawInput?: {
      file_path: string;
      edits: Edit[];
    };
    toolInput?: string;
  };
}

const MultiEditMessage: React.FC<MultiEditMessageProps> = ({ data }) => {
  const edits = data.rawInput?.edits || [];

  return (
    <div className="tool-message">
      {edits.length > 0 ? (
        <pre className="text-sm font-mono py-2 overflow-x-auto overflow-y-auto max-h-60">
          {edits.map((edit, index) => (
            <div key={index} className="px-3 py-0.5">
              {/* Old string (removed) */}
              {edit.old_string.split('\n').map((line, lineIndex) => (
                <div key={`old-${index}-${lineIndex}`} className="bg-red-800/30">
                  <span className="p-1">-</span> {line}
                </div>
              ))}

              {/* New string (added) */}
              {edit.new_string.split('\n').map((line, lineIndex) => (
                <div key={`new-${index}-${lineIndex}`} className="bg-green-800/30">
                  <span className="p-1">+</span> {line}
                </div>
              ))}
            </div>
          ))}
        </pre>
      ) : (
        <div>{data.toolInput || "No edits found"}</div>
      )}
    </div>
  );
};

export default MultiEditMessage;
