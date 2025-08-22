import React, { useState, useRef, useEffect } from "react";
import { useVSCode } from "../context/VSCodeContext";
import ModelDropdown from "./ModelDropdown";
import StatusBar from "./StatusBar";
import { HINT_TEMPLATES } from "../utils/constants";
import OptionsDropdown from "./OptionsDropdown";

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
  statusText: string;
  statusType: "ready" | "processing" | "error";
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
  statusText,
  statusType,
}) => {
  const { postMessage } = useVSCode();
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Try to get current file from VSCode context injected by the extension
  const getCurrentFileName = () => {
    try {
      const ctx = (window as any).vscodeCurrentFile;
      if (ctx && typeof ctx === "string" && ctx.trim()) return ctx;
    } catch {}
    return "this file";
  };

  const getRandomHint = () => {
    const G = getCurrentFileName();
    const rendered = HINT_TEMPLATES.map((tpl) => tpl.split("${G}").join(G));
    return rendered[Math.floor(Math.random() * rendered.length)];
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
      className="border-t border-border p-3 pb-2"
      style={{ borderColor: "#DE7356" }}
    >

      {/* Input Container */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 bg-input-background border border-border rounded-lg overflow-hidden">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Try "${placeholderHint}"`}
            className="w-full bg-transparent text-input-foreground p-3 resize-none outline-none min-h-[48px] leading-relaxed focus:outline-none focus:ring-0 focus:border-none focus:shadow-none focus:box-shadow-none"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
            disabled={disabled}
            rows={1}
          />

          {/* Controls */}
          <div className="flex justify-between items-center bg-input-background px-2 py-0.5">
            <div className="flex items-center gap-2">
              <StatusBar text={statusText} type={statusType} />
              {/* Model Selector */}
              <ModelDropdown
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={disabled}
              />

              {/* MCP Button */}
              <button
                onClick={handleMCPModal}
                className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/15 text-foreground rounded text-xs font-medium transition-colors hover:bg-gray-500/25"
                title="Configure MCP servers"
              >
                MCP
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M1 2.5l3 3 3-3"></path>
                </svg>
              </button>

              {/* Options Selector */}
              <OptionsDropdown
                planMode={planMode}
                onPlanModeChange={onTogglePlanMode}
                thinkingMode={thinkingMode}
                onThinkingModeChange={onToggleThinkingMode}
                disabled={disabled}
              />
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
