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
        <pre className="text-sm font-mono py-2">
          {edits.map((edit, index) => (
            <div key={index} className="px-3 py-0.5">
              {/* Old string (removed) */}
              <div className="bg-red-800/30">
                <span className="p-1">-</span> {edit.old_string}
              </div>

              {/* New string (added) */}
              <div className="bg-green-800/30">
                <span className="p-1">+</span> {edit.new_string}
              </div>
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
