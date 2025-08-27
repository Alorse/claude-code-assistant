import React from "react";
import FloatingMenuButton from "./FloatingMenuButton";
import { FloatingMenuOption } from "./FloatingMenu";

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

interface OptionsDropdownNewProps {
  planMode: boolean;
  onPlanModeChange: (enabled: boolean) => void;
  thinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const OptionsDropdownNew: React.FC<OptionsDropdownNewProps> = ({
  planMode,
  onPlanModeChange,
  thinkingMode,
  onThinkingModeChange,
  disabled = false,
}) => {
  // Create custom options for the floating menu with current state
  const customOptions: FloatingMenuOption[] = [
    {
      value: "plan",
      label: `Plan First ${planMode ? "✓" : ""}`,
      description: "Enable to see the plan before execution",
    },
    {
      value: "thinking",
      label: `Thinking Mode ${thinkingMode ? "✓" : ""}`,
      description: "Show detailed thinking process",
    },
  ];

  const handleOptionSelect = (value: string) => {
    if (value === "plan") {
      onPlanModeChange(!planMode);
    } else if (value === "thinking") {
      onThinkingModeChange(!thinkingMode);
    }
  };

  const getActiveOptionsCount = () => {
    let count = 0;
    if (planMode) count++;
    if (thinkingMode) count++;
    return count;
  };

  return (
    <FloatingMenuButton
      options={customOptions}
      onSelect={handleOptionSelect}
      disabled={disabled}
      placement="top"
      width="w-72"
      className={`bg-gray-500/15 text-foreground border-none outline-none transition-colors cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500/25"
      }`}
    >
      <div className="flex items-center gap-1">
        <div className="flex items-center justify-center w-4 h-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 20"
            fill="currentColor"
          >
            <g
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="2" y1="4" x2="5" y2="4" />
              <line x1="12" y1="4" x2="22" y2="4" />
              <circle cx="8" cy="4" r="3" fill="none" />
              <line x1="2" y1="14" x2="12" y2="14" />
              <line x1="19" y1="14" x2="22" y2="14" />
              <circle cx="16" cy="14" r="3" fill="none" />
            </g>
          </svg>
        </div>
        <span className="text-xs font-medium">
          {getActiveOptionsCount() > 0 && (
            <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
              {getActiveOptionsCount()}
            </span>
          )}
        </span>
      </div>
    </FloatingMenuButton>
  );
};

export default OptionsDropdownNew;
