import { useState, useRef, useCallback, useEffect } from "react";

/* global HTMLInputElement HTMLTextAreaElement getComputedStyle KeyboardEvent document */

interface UseCommandMenuReturn {
  isVisible: boolean;
  triggerPosition: { x: number; y: number } | null;
  showCommandMenu: (x: number, y: number) => void;
  hideCommandMenu: () => void;
  handleInputChange: (value: string, cursorPosition: number) => void;
}

export const useCommandMenu = (): UseCommandMenuReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const showCommandMenu = useCallback((x: number, y: number) => {
    setTriggerPosition({ x, y });
    setIsVisible(true);
  }, []);

  const hideCommandMenu = useCallback(() => {
    setIsVisible(false);
    setTriggerPosition(null);
  }, []);

  const handleInputChange = useCallback(
    (value: string, cursorPosition: number) => {
      // Check if @ was typed
      const beforeCursor = value.slice(0, cursorPosition);
      const atIndex = beforeCursor.lastIndexOf("@");

      if (atIndex !== -1 && atIndex < cursorPosition) {
        // Check if there's a space before @ or if it's at the beginning
        const beforeAt = beforeCursor.slice(0, atIndex);
        if (
          beforeAt === "" ||
          beforeAt.endsWith(" ") ||
          beforeAt.endsWith("\n")
        ) {
          // Calculate position for the command menu
          if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const lineHeight =
              parseInt(getComputedStyle(inputRef.current).lineHeight) || 20;

            // Calculate which line we're on
            const textBeforeCursor = beforeCursor;
            const lines = textBeforeCursor.split("\n");
            const currentLine = lines.length - 1;

            const x = rect.left + (atIndex - beforeAt.length) * 8; // Approximate character width
            const y = rect.top + (currentLine + 1) * lineHeight;

            showCommandMenu(x, y);
          }
        }
      } else {
        hideCommandMenu();
      }
    },
    [showCommandMenu, hideCommandMenu],
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        hideCommandMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, hideCommandMenu]);

  return {
    isVisible,
    triggerPosition,
    showCommandMenu,
    hideCommandMenu,
    handleInputChange,
  };
};
