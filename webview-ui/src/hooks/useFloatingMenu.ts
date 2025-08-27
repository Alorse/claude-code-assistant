import { useState, useRef, useCallback } from "react";
import { FloatingMenuOption } from "../components/FloatingMenu";

/* global React HTMLElement */

export interface UseFloatingMenuReturn {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export const useFloatingMenu = (
  options: FloatingMenuOption[],
  onSelect?: (value: string) => void,
): UseFloatingMenuReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const triggerRef = useRef<HTMLElement>(null);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(0);
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

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
            onSelect?.(options[selectedIndex].value);
            closeMenu();
          }
          break;
        case "Escape":
          e.preventDefault();
          closeMenu();
          triggerRef.current?.focus();
          break;
      }
    },
    [isOpen, options, selectedIndex, onSelect, closeMenu],
  );

  return {
    isOpen,
    triggerRef,
    openMenu,
    closeMenu,
    toggleMenu,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
};
