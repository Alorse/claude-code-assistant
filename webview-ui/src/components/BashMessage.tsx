import React from "react";

interface BashMessageProps {
  data: {
    toolInfo?: string;
    toolName?: string;
    rawInput?: {
      command: string;
      description?: string;
    };
    toolInput?: string;
  };
}

const BashMessage: React.FC<BashMessageProps> = ({ data }) => {
  const command = data.rawInput?.command || "";
  const description = data.rawInput?.description || "";

  return (
    <div className="tool-message mt-0">
      <pre className="text-sm font-mono">
        <div className="px-3">
          {description && (
            <div className="text-gray-600 text-xs py-1">{description}</div>
          )}
          <div className="permission-request px-2 py-1 border border-border bg-input-background">
            <div className="text-xs">
              <pre
                className={`whitespace-pre-wrap max-h-64 text-[#98c379] ${
                  command.length > 60
                    ? "overflow-auto"
                    : "overflow-visible"
                }`}
              >
                <span className="p-1">$</span> {command}
              </pre>
            </div>
          </div>
        </div>
      </pre>
    </div>
  );
};

export default BashMessage;
