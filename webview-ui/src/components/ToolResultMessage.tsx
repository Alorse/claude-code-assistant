import React, { useState, useMemo } from "react";

interface ToolResultMessageProps {
  data: any;
}

const ToolResultMessage: React.FC<ToolResultMessageProps> = ({ data }) => {
  const raw = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const lines = useMemo(() => raw.split("\n"), [raw]);
  const [expanded, setExpanded] = useState(false);
  const LINE_COUNT = 10;

  const shouldCollapse = lines.length > LINE_COUNT;
  const visibleLines = shouldCollapse && !expanded ? lines.slice(0, LINE_COUNT) : lines;

  return (
    <div className="tool-result-message px-2 py-1">
      <div className="text-sm font-medium mb-2">Tool Result</div>

      <div className="text-xs">
        {visibleLines.join("\n")}
      </div>

      {shouldCollapse && (
        <div className="mt-2">
          <button
            className="text-xs btn outlined"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? "Show less" : `Show more (${lines.length - LINE_COUNT} more lines)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ToolResultMessage;


