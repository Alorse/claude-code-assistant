import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface GenericDropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minWidth?: string;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  options,
  selectedValue,
  onSelectionChange,
  disabled = false,
  placeholder = "Select option...",
  className = "",
  minWidth = "min-w-48",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      // Calculate dropdown height estimate
      const itemHeight = 30; // height per item with padding
      const maxVisibleItems = Math.min(options.length, 6);
      const dropdownHeight = maxVisibleItems * itemHeight;

      // Check if there's enough space above, otherwise position below
      const spaceAbove = rect.top;

      let top: number;
      if (spaceAbove >= dropdownHeight + 4) {
        // Position above the button
        top = rect.top - dropdownHeight - 4;
      } else {
        // Position below the button as fallback
        top = rect.bottom + 4;
      }

      setDropdownPosition({
        top,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        // Check if click is outside both trigger and dropdown
        const dropdownElement = document.querySelector(
          "[data-dropdown-portal]",
        );
        if (
          !dropdownElement ||
          !dropdownElement.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setHoveredOption(null);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setHoveredOption(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onSelectionChange(optionValue);
    setIsOpen(false);
    setHoveredOption(null);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
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
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M1 2.5l3 3 3-3"></path>
        </svg>
      </button>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen &&
        createPortal(
          <>
            {/* Description tooltip */}
            {hoveredOption &&
              options.find((o) => o.value === hoveredOption)?.description && (
                <div className="px-3 py-2 border-t border-border bg-gray-500/10 absolute top-0 left-0 z-50">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {(() => {
                      const desc = options.find(
                        (o) => o.value === hoveredOption,
                      )?.description;
                      console.log("Rendering description:", desc);
                      return desc;
                    })()}
                  </p>
                </div>
              )}
            <div
              data-dropdown-portal
              className={`
              ${minWidth} bg-background border border-border rounded shadow-lg
              max-h-64 overflow-y-auto
            `}
              style={{
                position: "fixed",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                minWidth: `${dropdownPosition.width}px`,
                zIndex: 99999,
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  onMouseEnter={() => {
                    console.log(
                      "Hovering option:",
                      option.value,
                      option.description,
                    );
                    setHoveredOption(option.value);
                  }}
                  onMouseLeave={() => {
                    console.log("Leaving hover");
                    setHoveredOption(null);
                  }}
                  className={`
                  w-full flex items-center justify-between px-3 py-2 text-left text-sm 
                  transition-colors hover:bg-gray-500/15 border-none outline-none cursor-pointer
                  ${option.value === selectedValue ? "bg-gray-500/10" : ""}
                `}
                  title={option.description}
                >
                  <span className="text-foreground truncate">
                    {option.label}
                  </span>
                  {option.value === selectedValue && (
                    <span className="text-green-500 ml-2 flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default GenericDropdown;
