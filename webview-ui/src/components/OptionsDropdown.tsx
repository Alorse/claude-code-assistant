import React from "react";
import GenericDropdown from "./GenericDropdown";
import { Settings } from "lucide-react";

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
  <div className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
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
        onClick={() => onChange(!checked)}
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
        <div className="flex items-center justify-center w-5 h-5">
          <Settings className="w-4 h-4" />
        </div>
      }
    >
      <div className="py-1">
        <ToggleOption
          label="Plan First"
          checked={planMode}
          onChange={onPlanModeChange}
          description="Enable to see the plan before execution"
        />
        <div className="border-t border-border my-1" />
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
