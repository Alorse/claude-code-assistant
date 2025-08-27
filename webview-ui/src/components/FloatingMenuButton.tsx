import React from "react";
import FloatingMenu from "./FloatingMenu";
import { FloatingMenuOption } from "./FloatingMenu";
import { useFloatingMenu } from "../hooks/useFloatingMenu";

interface FloatingMenuButtonProps {
  options: FloatingMenuOption[];
  onSelect: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
  width?: string;
  disabled?: boolean;
}

const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({
  options,
  onSelect,
  children,
  className = "",
  placement = "bottom",
  width = "w-64",
  disabled = false,
}) => {
  const {
    isOpen,
    triggerRef,
    openMenu,
    closeMenu,
    selectedIndex,
    handleKeyDown,
  } = useFloatingMenu(options, onSelect);

  return (
    <>
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={openMenu}
        onKeyDown={handleKeyDown}
        className={`vscode-button flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        disabled={disabled}
      >
        {children}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      <FloatingMenu
        isOpen={isOpen}
        onClose={closeMenu}
        triggerRef={triggerRef}
        options={options}
        onSelect={onSelect}
        selectedIndex={selectedIndex}
        placement={placement}
        width={width}
      />
    </>
  );
};

export default FloatingMenuButton;
