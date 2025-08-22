import { useEffect } from "react";
import { UIMessage } from "../utils/messageTypes";

type Message = UIMessage;

interface UseMessageHandlerProps {
  addMessage: (type: Message["type"], content: React.ReactNode) => void;
  setStatusText: (text: string) => void;
  setStatusType: (type: "ready" | "processing" | "error") => void;
  setShowLoadingVerb: (show: boolean) => void;
  setChatState: React.Dispatch<React.SetStateAction<any>>;
  setHistoryOptions: React.Dispatch<React.SetStateAction<any[]>>;
  setHistoryLoading: (loading: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setDraftMessage: (message: string) => void;
}

export const useMessageHandler = ({
  addMessage,
  setStatusText,
  setStatusType,
  setShowLoadingVerb,
  setChatState,
  setHistoryOptions,
  setHistoryLoading,
  setHistoryOpen,
  setDraftMessage,
}: UseMessageHandlerProps) => {
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
          setChatState((prev: any) => ({
            ...prev,
            isProcessing: message.data.isProcessing,
          }));
          break;

        case "conversationList": {
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
            addMessage("error", message.data.content || "");
          } else {
            addMessage("tool-result", message.data.content || "");
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
            setChatState((prev: any) => ({
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
            setChatState((prev: any) => ({
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
          // Add the permission request as a proper message type
          if (message.data) {
            addMessage("permission-request", message.data);
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
          setChatState((prev: any) => ({
            ...prev,
            selectedModel: message.model,
          }));
          break;

        case "restoreInputText":
          setDraftMessage(message.data);
          break;

        case "sessionCleared":
          setChatState((prev: any) => ({
            ...prev,
            messages: [],
            currentSessionId: null,
          }));
          setDraftMessage("");
          break;

        default:
          console.log("Unhandled message type:", message.type);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    addMessage,
    setStatusText,
    setStatusType,
    setShowLoadingVerb,
    setChatState,
    setHistoryOptions,
    setHistoryLoading,
    setHistoryOpen,
    setDraftMessage,
  ]);
};
