import React, { useState, useEffect, useRef } from "react";
import { useVSCode } from "../context/VSCodeContext";
// Header removed in favor of view/title commands
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import StatusBar from "./StatusBar";
import ChatHistoryModal from "./ChatHistoryModal";

import { UIMessage } from "../utils/messageTypes";
import ToolUseMessage from "./ToolUseMessage";
type Message = UIMessage;

interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  currentSessionId: string | null;
  selectedModel: string;
  planMode: boolean;
  thinkingMode: boolean;
  draftMessage: string;
}

const ChatContainer: React.FC = () => {
  const { postMessage, isReady } = useVSCode();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isProcessing: false,
    currentSessionId: null,
    selectedModel: "default",
    planMode: false,
    thinkingMode: false,
    draftMessage: "",
  });

  const [statusText, setStatusText] = useState("Initializing...");
  const [statusType, setStatusType] = useState<
    "ready" | "processing" | "error"
  >("processing");
  const [showLoadingVerb, setShowLoadingVerb] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyOptions, setHistoryOptions] = useState<
    Array<{
      filename: string;
      startTime?: string;
      messageCount?: number;
      totalCost?: number;
      firstUserMessage?: string;
      lastUserMessage?: string;
    }>
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // Message handler for VS Code communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "ready":
          setStatusText(message.data);
          setStatusType("ready");
          break;

        case "userInput":
          addMessage("user", message.data);
          break;

        case "output":
          addMessage("claude", message.data);
          setShowLoadingVerb(false);
          break;

        case "error":
          addMessage("error", message.data);
          setStatusType("error");
          setShowLoadingVerb(false);
          break;

        case "loading":
          setStatusText(message.data);
          setStatusType("processing");
          break;

        case "clearLoading":
          setStatusText("Ready to chat with Claude Code Assistant!");
          setStatusType("ready");
          setShowLoadingVerb(false);
          break;

        case "setProcessing":
          setChatState((prev) => ({
            ...prev,
            isProcessing: message.data.isProcessing,
          }));
          break;

        case "conversationList": {
          console.log("conversationList", message);
          const items = (message.data || []).map((c: any) => ({
            filename: c.filename,
            startTime: c.startTime,
            messageCount: c.messageCount,
            totalCost: c.totalCost,
            firstUserMessage: c.firstUserMessage,
            lastUserMessage: c.lastUserMessage,
          }));
          setHistoryOptions(items);
          setHistoryLoading(false);
          setHistoryOpen(true);
          break;
        }

        case "toolUse": {
          // Parse tool use object and render a readable summary
          try {
            addToolUseMessage(message.data);
          } catch (err) {
            console.error("Failed to handle toolUse message:", err);
          }
          break;
        }

        case "toolResult": {
          // Show tool result (success or error) as system message
          if (message.data && message.data.isError) {
            addMessage(
              "error",
              message.data.content || JSON.stringify(message.data),
            );
          } else {
            addMessage(
              "system",
              message.data.content || JSON.stringify(message.data),
            );
          }
          break;
        }

        case "thinking": {
          if (message.data && String(message.data).trim()) {
            addMessage("system", `💭 Thinking... ${message.data}`);
          }
          break;
        }

        case "sessionInfo": {
          if (message.data && message.data.sessionId) {
            setChatState((prev) => ({
              ...prev,
              currentSessionId: message.data.sessionId,
            }));
            // addMessage("system", `Session resumed: ${message.data.sessionId}`);
          }
          break;
        }

        case "imagePath": {
          if (message.data && message.data.filePath) {
            // Insert file path text as a system note
            addMessage("system", `Image saved: ${message.data.filePath}`);
          }
          break;
        }

        case "sessionResumed": {
          if (message.data && message.data.sessionId) {
            setChatState((prev) => ({
              ...prev,
              currentSessionId: message.data.sessionId,
            }));
            // addMessage(
            //   "system",
            //   `📝 Resumed previous session • ${message.data.sessionId}`,
            // );
          }
          break;
        }

        case "loginRequired": {
          addMessage(
            "error",
            `🔐 Login Required\n${message.data || "API key invalid or expired"}`,
          );
          setStatusType("error");
          break;
        }

        case "permissionRequest": {
          // Show a simple system message indicating permission requested
          if (message.data) {
            const toolName =
              message.data.tool || message.data.toolName || "Tool";
            addMessage("system", `Permission requested: ${toolName}`);
          }
          break;
        }

        case "mcpServers": {
          // backend sent list of servers
          addMessage("system", `MCP servers updated`);
          break;
        }

        case "mcpServerSaved": {
          addMessage(
            "system",
            `✅ MCP server "${message.data.name}" saved successfully`,
          );
          break;
        }

        case "mcpServerDeleted": {
          addMessage(
            "system",
            `✅ MCP server "${message.data.name}" deleted successfully`,
          );
          break;
        }

        case "mcpServerError": {
          addMessage(
            "error",
            `❌ Error with MCP server: ${message.data?.error || message.data}`,
          );
          break;
        }

        case "workspaceFiles": {
          // used by file picker - show count
          if (Array.isArray(message.data)) {
            addMessage(
              "system",
              `${message.data.length} workspace files received`,
            );
          }
          break;
        }

        case "platformInfo": {
          // detect windows/wsl and show alert
          if (
            message.data &&
            message.data.isWindows &&
            !message.data.wslEnabled &&
            !message.data.wslAlertDismissed
          ) {
            addMessage(
              "system",
              `WSL detected on Windows — consider enabling WSL integration`,
            );
          }
          break;
        }

        case "permissionsData": {
          addMessage("system", `Permissions updated`);
          break;
        }

        case "showRestoreOption": {
          if (message.data)
            addMessage(
              "system",
              `Restore available: ${message.data.message || message.data.sha || JSON.stringify(message.data)}`,
            );
          break;
        }

        case "restoreProgress": {
          if (message.data) addMessage("system", `🔄 ${message.data}`);
          break;
        }

        case "restoreSuccess": {
          addMessage("system", `✅ ${message.data.message || message.data}`);
          break;
        }

        case "restoreError": {
          addMessage("error", `❌ ${message.data}`);
          break;
        }

        case "modelSelected":
          setChatState((prev) => ({
            ...prev,
            selectedModel: message.model,
          }));
          break;

        case "restoreInputText":
          setChatState((prev) => ({
            ...prev,
            draftMessage: message.data,
          }));
          break;

        case "sessionCleared":
          setChatState((prev) => ({
            ...prev,
            messages: [],
            currentSessionId: null,
          }));
          break;

        default:
          console.log("Unhandled message type:", message.type);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const addMessage = (type: Message["type"], content: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date().toISOString(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  // Parse and display toolUse messages (based on src_old/ui.ts)
  const addToolUseMessage = (data: any) => {
    try {
      const toolInfo =
        (data && data.toolInfo) || (data && data.toolName) || "Tool";
      const toolName = (data && data.toolName) || "";

      // Prefer rawInput when available
      const rawInput = data && data.rawInput ? data.rawInput : null;
      const toolInput = data && data.toolInput ? data.toolInput : null;

      let body = "";

      if (rawInput && typeof rawInput === "object") {
        if (toolName === "TodoWrite" && rawInput.todos) {
          // Summarize todos
          const todos = rawInput.todos.map((t: any) => {
            const status =
              t.status === "completed"
                ? "✅"
                : t.status === "in_progress"
                  ? "🔄"
                  : "⏳";
            const priority = t.priority ? ` [${t.priority}]` : "";
            return `${status} ${t.content}${priority}`;
          });
          body = "Todo List Update:\n" + todos.join("\n");
        } else if (
          toolName === "Edit" &&
          rawInput.old_string &&
          rawInput.new_string
        ) {
          body = formatEditToolDiff(rawInput);
        } else if (toolName === "MultiEdit" && Array.isArray(rawInput.edits)) {
          body = formatMultiEditToolDiff(rawInput);
        } else if (toolName === "Write" && rawInput.content) {
          body = formatWriteToolDiff(rawInput);
        } else {
          body = formatToolInputUI(rawInput);
        }
      } else if (toolInput) {
        // toolInput may be a stringified JSON
        try {
          const parsed =
            typeof toolInput === "string" ? JSON.parse(toolInput) : toolInput;
          body = formatToolInputUI(parsed);
        } catch (err) {
          body =
            typeof toolInput === "string"
              ? toolInput
              : JSON.stringify(toolInput);
        }
      } else if (data && data.toolName) {
        body = `Executing: ${data.toolName}`;
      } else {
        body = JSON.stringify(data);
      }

      // Compose final message
      const final = `${toolInfo}\n${body}`;
      addMessage("system", final);
    } catch (err) {
      console.error("Error in addToolUseMessage:", err);
      addMessage("system", `Tool invoked: ${JSON.stringify(data)}`);
    }
  };

  const formatToolInputUI = (input: any) => {
    if (!input) return "";
    if (typeof input === "string") {
      if (input.length > 200) return input.substring(0, 197) + "...";
      return input;
    }

    // If it's a simple object with only file_path
    if (input.file_path && Object.keys(input).length === 1) {
      return `File: ${input.file_path}`;
    }

    const parts: string[] = [];
    for (const [k, v] of Object.entries(input)) {
      let val = typeof v === "string" ? v : JSON.stringify(v, null, 2);
      if (val.length > 200) val = val.substring(0, 197) + "...";
      parts.push(`${k}: ${val}`);
    }
    return parts.join("\n");
  };

  const formatEditToolDiff = (input: any) => {
    const file = input.file_path || "unknown";
    const oldLines = (input.old_string || "").split("\n");
    const newLines = (input.new_string || "").split("\n");

    const max = 6;
    const preview: string[] = [];
    preview.push(`File: ${file}`);
    preview.push("Changes:");

    const combined: Array<{ type: string; content: string }> = [];
    for (const l of oldLines) combined.push({ type: "removed", content: l });
    for (const l of newLines) combined.push({ type: "added", content: l });

    const visible = combined.slice(0, max);
    for (const line of visible) {
      const prefix = line.type === "removed" ? "- " : "+ ";
      preview.push(prefix + line.content);
    }
    if (combined.length > max)
      preview.push(`... and ${combined.length - max} more lines`);
    return preview.join("\n");
  };

  const formatMultiEditToolDiff = (input: any) => {
    const file = input.file_path || "unknown";
    const edits = Array.isArray(input.edits) ? input.edits : [];
    const parts: string[] = [];
    parts.push(`File: ${file}`);
    parts.push(`Edits: ${edits.length}`);
    if (edits.length > 0) {
      const first = edits[0];
      parts.push(formatEditToolDiff(first));
      if (edits.length > 1)
        parts.push(`... plus ${edits.length - 1} more edits`);
    }
    return parts.join("\n");
  };

  const formatWriteToolDiff = (input: any) => {
    const file = input.file_path || "unknown";
    const content = input.content || "";
    const lines = content.split("\n");
    const max = 6;
    const preview = lines.slice(0, max).map((l: string) => "+ " + l);
    if (lines.length > max)
      preview.push(`... and ${lines.length - max} more lines`);
    return [`File: ${file}`, "New file content:"].concat(preview).join("\n");
  };

  const sendMessage = (text: string) => {
    console.log("sendMessage called with:", text);
    console.log("Current chatState:", {
      isProcessing: chatState.isProcessing,
      trimmedText: text.trim(),
    });

    if (!text.trim() || chatState.isProcessing) {
      console.log("Message send blocked:", {
        hasText: !!text.trim(),
        notProcessing: !chatState.isProcessing,
      });
      return;
    }

    console.log("Sending message via postMessage:", text);

    // Show loading verb immediately when sending
    setShowLoadingVerb(true);

    postMessage({
      type: "sendMessage",
      text,
      planMode: chatState.planMode,
      thinkingMode: chatState.thinkingMode,
    });

    setChatState((prev) => ({
      ...prev,
      draftMessage: "",
    }));
  };

  const togglePlanMode = () => {
    setChatState((prev) => ({
      ...prev,
      planMode: !prev.planMode,
    }));
  };

  const toggleThinkingMode = () => {
    setChatState((prev) => ({
      ...prev,
      thinkingMode: !prev.thinkingMode,
    }));
  };

  const handleDraftChange = (text: string) => {
    setChatState((prev) => ({
      ...prev,
      draftMessage: text,
    }));

    // Debounce saving draft message
    const timeoutId = setTimeout(() => {
      postMessage({
        type: "saveInputText",
        text,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectHistory = (filename: string) => {
    postMessage({ type: "loadConversation", filename });
    setHistoryOpen(false);
  };

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-focus mx-auto mb-4"></div>
          <p className="text-description">Loading Claude Code Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-editor-background text-foreground font-vscode">
      {/* Top actions moved to view/title commands */}

      <ChatHistoryModal
        open={historyOpen}
        loading={historyLoading}
        items={historyOptions}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList
          messages={chatState.messages}
          isProcessing={showLoadingVerb}
        />
        <div ref={messagesEndRef} />
      </div>

      <InputArea
        value={chatState.draftMessage}
        onChange={handleDraftChange}
        onSend={sendMessage}
        disabled={chatState.isProcessing}
        planMode={chatState.planMode}
        thinkingMode={chatState.thinkingMode}
        selectedModel={chatState.selectedModel}
        onTogglePlanMode={togglePlanMode}
        onToggleThinkingMode={toggleThinkingMode}
      />

      <StatusBar text={statusText} type={statusType} />
    </div>
  );
};

export default ChatContainer;
