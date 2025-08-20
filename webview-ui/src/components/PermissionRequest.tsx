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

  return (
    <div className="permission-request p-3 rounded-lg border border-purple-300 bg-purple-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center">
            🔐
          </div>
          <div>
            <div className="text-sm font-semibold">Permission Required</div>
            <div className="text-xs text-description">
              Allow <strong>{tool}</strong> to execute?
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => onRespond(id, false)}>
            Deny
          </button>
          <button
            className="btn always-allow"
            onClick={() => onRespond(id, true, true)}
          >
            Always allow
          </button>
          <button className="btn primary" onClick={() => onRespond(id, true)}>
            Allow
          </button>
        </div>
      </div>
      {displayPattern && (
        <div className="text-xs text-description">
          Command: <code>{displayPattern}</code>
        </div>
      )}
    </div>
  );
};

export default PermissionRequest;
