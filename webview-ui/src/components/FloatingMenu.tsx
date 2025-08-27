import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

export interface FloatingMenuOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
}

export interface FloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  options: FloatingMenuOption[];
  onSelect: (value: string) => void;
  selectedIndex?: number;
  className?: string;
  maxHeight?: string;
  width?: string;
  placement?: "top" | "bottom" | "left" | "right";
  offset?: number;
}

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  options,
  onSelect,
  selectedIndex = 0,
  className = "",
  maxHeight = "max-h-48",
  width = "w-56",
  placement = "bottom",
  offset = 8,
}) => {
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position for the menu
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    console.log("placement", placement);

    // Calculate position based on placement
    switch (placement) {
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
        break;
      case "top":
        top = triggerRect.top - offset;
        left = triggerRect.left;
        break;
      case "left":
        top = triggerRect.top;
        left = triggerRect.left - offset;
        break;
      case "right":
        top = triggerRect.top;
        left = triggerRect.right + offset;
        break;
    }

    // For top placement, we need to account for menu height
    if (placement === "top") {
      top = top - 192; // max-h-48 = 192px
    }

    // Adjust horizontal position to keep menu in viewport
    if (left < 8) {
      left = 8;
    } else if (left + 224 > viewportWidth) {
      // w-56 = 224px
      left = viewportWidth - 224 - 8;
    }

    // Adjust vertical position to keep menu in viewport
    if (top < 8) {
      top = 8;
    } else if (top + 192 > viewportHeight) {
      // max-h-48 = 192px
      top = viewportHeight - 192 - 8;
    }

    setPosition({ top, left, placement });
  }, [triggerRef, placement, offset]);

  // Update position when menu opens or window resizes
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(calculatePosition, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, calculatePosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          // TODO: Implement keyboard navigation
          break;
        case "ArrowUp":
          e.preventDefault();
          // TODO: Implement keyboard navigation
          break;
        case "Enter":
          e.preventDefault();
          // TODO: Implement keyboard navigation
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`
        fixed z-50 bg-background/95 backdrop-blur-sm border border-border 
        rounded-lg shadow-xl overflow-hidden
        ${width} ${maxHeight}
        ${className}
      `}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-1">
        {options.map((option, index) => (
          <div
            key={option.value}
            className={`
              flex items-center gap-2 px-2 py-1 text-xs cursor-pointer rounded-md
              transition-colors
              ${index === 0 ? "mt-0" : "mt-0.5"}
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
              <div className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                {option.shortcut}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default FloatingMenu;
