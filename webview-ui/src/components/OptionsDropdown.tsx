import React from "react";
import GenericDropdown from "./GenericDropdown";

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({
  label,
  checked,
  onChange,
  description,
}) => (
  <div className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-500/25 dark:hover:bg-gray-500/25 rounded-lg">
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
      </div>
      <div
        className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
          checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </label>
  </div>
);

interface OptionsDropdownProps {
  planMode: boolean;
  onPlanModeChange: (enabled: boolean) => void;
  thinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  planMode,
  onPlanModeChange,
  thinkingMode,
  onThinkingModeChange,
  disabled = false,
}) => {
  return (
    <GenericDropdown
      disabled={disabled}
      icon={
        <div className="flex items-center justify-center w-4 h-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="800"
            height="450"
            viewBox="0 0 24 20"
            fill="currentColor"
          >
            <g
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
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
      }
    >
      <div className="[&>*:not(:first-child)]:mt-1">
        <ToggleOption
          label="Plan First"
          checked={planMode}
          onChange={onPlanModeChange}
          description="Enable to see the plan before execution"
        />
        <ToggleOption
          label="Thinking Mode"
          checked={thinkingMode}
          onChange={onThinkingModeChange}
          description="Show detailed thinking process"
        />
      </div>
    </GenericDropdown>
  );
};

export default OptionsDropdown;
