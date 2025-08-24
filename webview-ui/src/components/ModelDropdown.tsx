import React from "react";
import GenericDropdown, { DropdownOption } from "./GenericDropdown";
import { AVAILABLE_MODELS } from "../../../src/utils/models";

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  // Convert model configs to dropdown options
  const options: DropdownOption[] = AVAILABLE_MODELS.map((model) => ({
    value: model.value,
    label: model.label,
    description: model.description,
  }));

  return (
    <GenericDropdown
      options={options}
      selectedValue={selectedModel}
      onSelectionChange={onModelChange}
      disabled={disabled}
      placeholder="Select model..."
      minWidth="min-w-52"
    />
  );
};

export default ModelDropdown;
