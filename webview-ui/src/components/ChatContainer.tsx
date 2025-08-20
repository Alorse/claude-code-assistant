import React, { useState, useEffect, useRef } from "react";
import { useVSCode } from "../context/VSCodeContext";
// Header removed in favor of view/title commands
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import StatusBar from "./StatusBar";
import ChatHistoryModal from "./ChatHistoryModal";

import { UIMessage } from "../utils/messageTypes";
type Message = UIMessage;
// ToolUseMessage component is imported by MessageList, not used here directly

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
          // Add a structured tool usage message so UI can render it with ToolUseMessage
          try {
            addMessage("tool", message.data);
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
              "tool-result",
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

  const addMessage = (type: Message["type"], content: React.ReactNode) => {
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

  // addToolUseMessage removed from here; UI now renders tool messages via ToolUseMessage component

  // Formatting helpers removed; ToolUseMessage/ToolResult components handle presentation

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
