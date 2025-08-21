import React, { useState, useMemo } from "react";
import SystemToggle from "./SystemToggle";

interface ToolResultMessageProps {
  data: any;
}

const ToolResultMessage: React.FC<ToolResultMessageProps> = ({ data }) => {
  const raw = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  // Extract system reminder blocks
  const systemReminderRegex = /<system-reminder>([\s\S]*?)<\/system-reminder>/g;
  const reminders: string[] = [];
  const stripped = raw.replace(systemReminderRegex, (_, g1) => {
    reminders.push(g1.trim());
    return ""; // remove from displayed text
  });

  const lines = useMemo(() => stripped.split("\n"), [stripped]);
  const [expanded, setExpanded] = useState(false);
  const LINE_COUNT = 10;

  const shouldCollapse = lines.length > LINE_COUNT;
  const visibleLines =
    shouldCollapse && !expanded ? lines.slice(0, LINE_COUNT) : lines;

  return (
    <div className="tool-result-message px-2 py-1">
      <div className="text-sm font-medium mb-2">Tool Result</div>

      <div className="text-xs">
        <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
          {visibleLines.join("\n")}
        </pre>
      </div>

      {shouldCollapse && (
        <div className="mt-2">
          <button
            className="text-xs btn outlined"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded
              ? "Show less"
              : `Show more (${lines.length - LINE_COUNT} more lines)`}
          </button>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="mt-2">
          {reminders.map((r, idx) => (
            <div key={idx} className="mt-2">
              {/* collapsed by default via SystemToggle component */}
              <SystemToggle content={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolResultMessage;
