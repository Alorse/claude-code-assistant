import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption =
    options?.find((opt) => opt.value === selectedValue) || null;

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    // Position logic can be added back if needed
    if (triggerRef.current) {
      // const rect = triggerRef.current.getBoundingClientRect();
      // Use rect for positioning logic when needed
    }
  };

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
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
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
                ? selectedOption.label.length > 15
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

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50"
            onClick={handleClickOutside}
          >
            <div
              className={`bg-background border border-border rounded-md shadow-lg overflow-auto max-h-[calc(100vh-8rem)] ${minWidth}`}
              onClick={(e) => e.stopPropagation()}
            >
              {children || (
                <>
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedValue === option.value
                          ? "bg-gray-100 dark:bg-gray-800 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        onSelectionChange(option.value);
                        setIsOpen(false);
                      }}
                      title={option.description}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default GenericDropdown;
