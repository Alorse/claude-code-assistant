import React, { useState, useRef, useEffect, ReactNode } from "react";
import FloatingMenu from "./FloatingMenu";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  title?: string;
}

interface GenericDropdownProps {
  options?: DropdownOption[];
  selectedValue?: string;
  onSelectionChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minWidth?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  options = [],
  selectedValue = "",
  onSelectionChange = () => {},
  disabled = false,
  placeholder = "Select option...",
  className = "",
  minWidth = "min-w-48",
  children,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption =
    options?.find((opt) => opt.value === selectedValue) || null;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center gap-1 px-2 py-1 bg-gray-500/15 text-foreground rounded text-xs font-medium 
          transition-colors cursor-pointer border-none outline-none
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500/25"}
          ${isOpen ? "bg-gray-500/25" : ""}
        `}
        title={selectedOption?.description || placeholder}
      >
        {icon || (
          <>
            <span>
              {selectedOption?.label
                ? selectedOption.label.startsWith("Default")
                  ? "Default"
                  : selectedOption.label.length > 15
                    ? `${selectedOption.label.substring(0, 15)}...`
                    : selectedOption.label
                : placeholder}
            </span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="currentColor"
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="M1 2.5l3 3 3-3"></path>
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu - Using FloatingMenu */}
      <FloatingMenu
        isOpen={isOpen}
        onClose={handleClickOutside}
        triggerRef={triggerRef}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description,
        }))}
        onSelect={(value) => {
          onSelectionChange(value);
          setIsOpen(false);
        }}
        placement="right"
        width={minWidth}
        maxHeight="max-h-48"
      />
    </div>
  );
};

export default GenericDropdown;
