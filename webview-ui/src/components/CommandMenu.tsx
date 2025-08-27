import React, { useState, useEffect, useRef, useCallback } from "react";
import { FloatingMenu, FloatingMenuOption } from "./FloatingMenu";

interface CommandMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (command: string) => void;
  triggerPosition: { x: number; y: number } | null;
  options: FloatingMenuOption[];
  className?: string;
  width?: string;
}

const CommandMenu: React.FC<CommandMenuProps> = ({
  isVisible,
  onClose,
  onSelect,
  triggerPosition,
  options,
  className = "",
  width = "w-72",
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset selection when menu opens
  useEffect(() => {
    if (isVisible) {
      setSelectedIndex(0);
    }
  }, [isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % options.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + options.length) % options.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (options[selectedIndex]) {
            onSelect(options[selectedIndex].value);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, options, selectedIndex, onSelect, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible || !triggerPosition) return null;

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 bg-background/95 backdrop-blur-sm border border-border 
        rounded-lg shadow-xl overflow-hidden
        ${width} ${className}
      `}
      style={{
        top: `${triggerPosition.y}px`,
        left: `${triggerPosition.x}px`,
        transform: "translateY(-100%)", // Position above the cursor
      }}
    >
      <div className="p-1.5 border-b border-border bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground px-1.5 py-0.5">
          Commands
        </div>
      </div>
      <div className="p-1 max-h-48 overflow-auto">
        {options.map((option, index) => (
          <div
            key={option.value}
            className={`
              flex items-center gap-2 px-2 py-1 text-xs cursor-pointer rounded-md
              transition-colors
              ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 hover:text-accent-foreground"
              }
            `}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            title={option.description}
          >
            {option.icon && (
              <div className="flex-shrink-0 w-4 h-4 text-muted-foreground">
                {option.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{option.label}</div>
              {option.description && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {option.description}
                </div>
              )}
            </div>
            {option.shortcut && (
              <div className="flex-shrink-0 text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {option.shortcut}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandMenu;
