import React from "react";
import SystemToggle from "./SystemToggle";

interface ToolUseErrorMessageProps {
  content: string;
  toolUseId: string;
}
const ToolUseErrorMessage: React.FC<ToolUseErrorMessageProps> = ({
  content,
  toolUseId,
}) => {
  // Extract the error message from the content
  const errorMessage = content
    .replace(/<\/?(tool_use_error|error)>/g, "")
    .trim();

  return (
    <SystemToggle
      headline={["Hide Tool Error", "Show Tool Error"]}
      className="text-red-300"
      content={
        <div>
          <div className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
          {toolUseId && (
            <div className="mt-1 text-xs text-red-500 dark:text-red-400 opacity-70">
              ID: {toolUseId}
            </div>
          )}
        </div>
      }
    />
  );
};

export default ToolUseErrorMessage;
