import React, { useState, useRef, useEffect } from "react";
import { useVSCode } from "../context/VSCodeContext";
import ModelDropdown from "./ModelDropdown";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled: boolean;
  planMode: boolean;
  thinkingMode: boolean;
  selectedModel: string;
  onTogglePlanMode: () => void;
  onToggleThinkingMode: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  disabled,
  planMode,
  thinkingMode,
  selectedModel,
  onTogglePlanMode,
  onToggleThinkingMode,
}) => {
  const { postMessage } = useVSCode();
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Dynamic placeholder hint logic for input area
  // ${G} is the current file name, fallback to "this file" if not available
  const getCurrentFileName = () => {
    // Try to get from VSCode context if available, fallback to "this file"
    // You can wire this up to your context/provider if you have file info
    if ((window as any).vscodeCurrentFile) {
      return (window as any).vscodeCurrentFile;
    }
    return "this file";
  };

  const getRandomHint = () => {
    const G = getCurrentFileName();
    const hints = [
      "fix lint errors",
      "fix typecheck errors",
      `how does ${G} work?`,
      `refactor ${G}`,
      "how do I log an error?",
      `edit ${G} to...`,
      `write a test for ${G}`,
      "create a util logging.py that...",
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  const [placeholderHint] = useState(getRandomHint());

  // Sync with parent value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [localValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (localValue.trim() && !disabled) {
      onSend(localValue.trim());
      setLocalValue("");
    }
  };

  const handleModelChange = (newModel: string) => {
    postMessage({ type: "selectModel", model: newModel });
  };

  const handleMCPModal = () => {
    postMessage({ type: "loadMCPServers" });
    // TODO: Implement MCP modal
  };

  const handleSlashCommands = () => {
    // TODO: Implement slash commands modal
  };

  const handleFilePicker = () => {
    postMessage({ type: "getWorkspaceFiles" });
    // TODO: Implement file picker modal
  };

  const handleImageSelect = () => {
    postMessage({ type: "selectImageFile" });
  };

  return (
    <div
      className="border-t border-border bg-panel-background p-3"
      style={{ borderColor: "#DE7356" }}
    >
      {/* Mode Toggles */}
      <div className="flex items-center gap-4 mb-2 text-xs">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-foreground/80 hover:text-foreground">
            <span onClick={onTogglePlanMode}>Plan First</span>
            <div
              className={`relative w-7 h-4 rounded-full cursor-pointer transition-colors ${
                planMode ? "bg-button-background" : "bg-border"
              }`}
              onClick={onTogglePlanMode}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  planMode ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-foreground/80 hover:text-foreground">
            <span onClick={onToggleThinkingMode}>Thinking Mode</span>
            <div
              className={`relative w-7 h-4 rounded-full cursor-pointer transition-colors ${
                thinkingMode ? "bg-button-background" : "bg-border"
              }`}
              onClick={onToggleThinkingMode}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  thinkingMode ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Input Container */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 bg-input-background border border-input-border rounded-md overflow-hidden focus-within:border-focus">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Try "${placeholderHint}"`}
            className="w-full bg-transparent text-input-foreground p-3 resize-none outline-none min-h-[68px] leading-relaxed"
            disabled={disabled}
            rows={1}
          />

          {/* Controls */}
          <div className="flex justify-between items-center p-1 border-t border-border bg-input-background">
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <ModelDropdown
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={disabled}
              />

              {/* MCP Button */}
              <button
                onClick={handleMCPModal}
                className="flex items-center gap-1 px-2 py-1 bg-gray-500/15 text-foreground rounded text-xs font-medium transition-colors hover:bg-gray-500/25"
                title="Configure MCP servers"
              >
                MCP
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M1 2.5l3 3 3-3"></path>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Slash Commands */}
              <button
                onClick={handleSlashCommands}
                className="p-1 text-foreground rounded transition-colors hover:bg-white/10"
                title="Slash commands"
              >
                /
              </button>

              {/* File Picker */}
              <button
                onClick={handleFilePicker}
                className="p-1 text-foreground rounded transition-colors hover:bg-white/10"
                title="Reference files"
              >
                @
              </button>

              {/* Image Button */}
              <button
                onClick={handleImageSelect}
                className="p-1 text-foreground rounded transition-colors hover:bg-white/10"
                title="Attach images"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="currentColor"
                >
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"></path>
                  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71l-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"></path>
                </svg>
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={disabled || !localValue.trim()}
                className="vscode-button flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <span className="text-xs">⏎</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
