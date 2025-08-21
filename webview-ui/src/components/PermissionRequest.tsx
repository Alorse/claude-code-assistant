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

  return (
    <>
      <div className="permission-request px-2 py-1 rounded-lg border border-border bg-input-background">
        <div className="flex items-center justify-between m-1">
          <div className="flex items-center gap-2">
            <div className="text-xs text-description">
              Allow <strong>{tool}</strong> to execute?
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
      {displayPattern && (
        <div className="tool-result-message px-2 py-1">
          <div className="text-sm font-medium mb-2">Command</div>

          <div className="text-xs">
            <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
              {displayPattern}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};

export default PermissionRequest;
