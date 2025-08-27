import React, { useState, useRef, useEffect } from "react";
import CommandMenu from "./CommandMenu";
import { useCommandMenu } from "../hooks/useCommandMenu";
import { FloatingMenuOption } from "./FloatingMenu";

interface CommandInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  className?: string;
}

const CommandInput: React.FC<CommandInputProps> = ({
  onSend,
  placeholder = "Type @ to see commands...",
  className = "",
}) => {
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isVisible, triggerPosition, hideCommandMenu, handleInputChange } =
    useCommandMenu();

  // Sample commands - you can customize these
  const commands: FloatingMenuOption[] = [
    {
      value: "help",
      label: "Help",
      description: "Show available commands",
      icon: "❓",
      shortcut: "Ctrl+H",
    },
    {
      value: "search",
      label: "Search",
      description: "Search through conversation",
      icon: "🔍",
      shortcut: "Ctrl+F",
    },
    {
      value: "code",
      label: "Code",
      description: "Generate or explain code",
      icon: "💻",
      shortcut: "Ctrl+C",
    },
    {
      value: "explain",
      label: "Explain",
      description: "Explain a concept in detail",
      icon: "📚",
      shortcut: "Ctrl+E",
    },
    {
      value: "summarize",
      label: "Summarize",
      description: "Summarize the conversation",
      icon: "📝",
      shortcut: "Ctrl+S",
    },
  ];

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;

    setValue(newValue);
    setCursorPosition(newCursorPosition);
    handleInputChange(newValue, newCursorPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
        setValue("");
        setCursorPosition(0);
        hideCommandMenu();
      }
    }
  };

  const handleCommandSelect = (command: string) => {
    // Replace the @command with the actual command
    const beforeAt = value.slice(0, value.lastIndexOf("@"));
    const afterCursor = value.slice(cursorPosition);
    const newValue = `${beforeAt}@${command} ${afterCursor}`;

    setValue(newValue);
    hideCommandMenu();

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = beforeAt.length + command.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPosition(target.selectionStart);
        }}
        placeholder={placeholder}
        className={`
          w-full min-h-[40px] max-h-32 px-3 py-2 bg-background border border-border 
          rounded-lg text-sm resize-none outline-none transition-colors
          focus:border-ring focus:ring-2 focus:ring-ring/20
          placeholder:text-muted-foreground
        `}
        rows={1}
        style={{
          resize: "none",
          overflow: "hidden",
        }}
      />

      <CommandMenu
        isVisible={isVisible}
        onClose={hideCommandMenu}
        onSelect={handleCommandSelect}
        triggerPosition={triggerPosition}
        options={commands}
        width="w-80"
      />
    </div>
  );
};

export default CommandInput;
