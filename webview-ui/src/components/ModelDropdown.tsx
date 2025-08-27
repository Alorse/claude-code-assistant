import React from "react";
import FloatingMenuButton from "./FloatingMenuButton";
import { FloatingMenuOption } from "./FloatingMenu";
import { AVAILABLE_MODELS } from "../../../src/utils/models";

interface ModelDropdownNewProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

const ModelDropdownNew: React.FC<ModelDropdownNewProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  // Convert model configs to floating menu options
  const options: FloatingMenuOption[] = AVAILABLE_MODELS.map((model) => ({
    value: model.value,
    label: model.label,
    description: model.description,
  }));

  const selectedModelData = AVAILABLE_MODELS.find(
    (m) => m.value === selectedModel,
  );

  return (
    <FloatingMenuButton
      options={options}
      onSelect={onModelChange}
      disabled={disabled}
      placement="top"
      width="w-64"
      className={`bg-gray-500/15 text-foreground border-none outline-none transition-colors cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500/25"
      }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">
          {selectedModelData?.label
            ? selectedModelData.label.length > 15
              ? `${selectedModelData.label.substring(0, 15)}...`
              : selectedModelData.label
            : "Select model..."}
        </span>
      </div>
    </FloatingMenuButton>
  );
};

export default ModelDropdownNew;
