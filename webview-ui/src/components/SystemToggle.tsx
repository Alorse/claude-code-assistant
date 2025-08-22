import React, { useState } from "react";

interface Props {
  headline: string[];
  content: React.ReactNode;
  id?: string;
  className?: string;
}

const SystemToggle: React.FC<Props> = ({ headline, content, className }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="system-reminder my-2">
      <button
        className={`text-xs btn outlined text-gray-300 hover:text-gray-100 flex items-center gap-2 opacity-50 ${className}`}
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span aria-hidden>{open ? "-" : "+"}</span>
        <span>{open ? headline[0] : headline[1]}</span>
      </button>
      {open && (
        <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      )}
    </div>
  );
};

export default SystemToggle;
