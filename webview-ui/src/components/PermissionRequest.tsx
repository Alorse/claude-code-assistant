import React from "react";

interface PermissionRequestProps {
  id: string;
  tool: string;
  pattern?: string | null;
  onRespond: (id: string, approved: boolean, alwaysAllow?: boolean) => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  id,
  tool,
  pattern,
  onRespond,
}) => {
  const displayPattern = pattern ? pattern.replace(" *", "") : null;
  const className =
    "vscode-button flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const getToolQuestion = (tool: string) => {
    switch (tool) {
      case "Write":
      case "Edit":
      case "MultiEdit":
      case "TodoWrite":
        return "Allow to make this edit?";
      case "ExitPlanMode":
        return "Would you like to proceed?";
      case "Read":
        return "Allow to read this file?";
      case "WebSearch":
        return "Allow to search the web?";
      case "Bash":
        return "Allow to execute this command?";
      default:
        return `Allow ${tool} to execute?`;
    }
  };

  return (
    <>
      {/* {displayPattern && (
        <div className="permission-request px-2 py-1">
          <div className="text-xs">
            <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
              {displayPattern}
            </pre>
          </div>
        </div>
      )} */}
      <div className="permission-request px-2 py-1 rounded-lg border border-border bg-input-background">
        <div className="flex items-center justify-between m-1">
          <div className="flex items-center gap-2">
            <div className="text-xs text-description">
              {getToolQuestion(tool)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`${className} primary`}
              onClick={() => onRespond(id, true)}
            >
              Allow
            </button>
            <button
              className={`${className} always-allow`}
              onClick={() => onRespond(id, true, true)}
            >
              Always allow
            </button>
            <button
              className={`${className} bg-red-500/50 hover:bg-red-500/80`}
              onClick={() => onRespond(id, false)}
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionRequest;
