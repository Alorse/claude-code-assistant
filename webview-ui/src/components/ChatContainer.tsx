import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useVSCode } from "../context/VSCodeContext";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import ChatHistoryModal from "./ChatHistoryModal";
import { useMessageHandler } from "../hooks/useMessageHandler";

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
  });

  // Separate state for draft message to prevent MessageList re-renders
  const [draftMessage, setDraftMessage] = useState("");

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

  const addMessage = useCallback(
    (type: Message["type"], content: React.ReactNode) => {
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
    },
    [],
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  const messageHandlerProps = useMemo(
    () => ({
      addMessage,
      setStatusText,
      setStatusType,
      setShowLoadingVerb,
      setChatState,
      setHistoryOptions,
      setHistoryLoading,
      setHistoryOpen,
      setDraftMessage,
    }),
    [addMessage],
  );

  useMessageHandler(messageHandlerProps);

  // addToolUseMessage removed from here; UI now renders tool messages via ToolUseMessage component

  // Formatting helpers removed; ToolUseMessage/ToolResult components handle presentation

  const sendMessage = useCallback(
    (text: string) => {
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

      setDraftMessage("");
    },
    [
      chatState.isProcessing,
      chatState.planMode,
      chatState.thinkingMode,
      postMessage,
    ],
  );

  const togglePlanMode = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      planMode: !prev.planMode,
    }));
  }, []);

  const toggleThinkingMode = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      thinkingMode: !prev.thinkingMode,
    }));
  }, []);

  const handleDraftChange = useCallback(
    (text: string) => {
      setDraftMessage(text);

      // Debounce saving draft message
      const timeoutId = setTimeout(() => {
        postMessage({
          type: "saveInputText",
          text,
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [postMessage],
  );

  const handleSelectHistory = useCallback(
    (filename: string) => {
      postMessage({ type: "loadConversation", filename });
      setHistoryOpen(false);
    },
    [postMessage],
  );

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
        value={draftMessage}
        onChange={handleDraftChange}
        onSend={sendMessage}
        disabled={chatState.isProcessing}
        planMode={chatState.planMode}
        thinkingMode={chatState.thinkingMode}
        selectedModel={chatState.selectedModel}
        onTogglePlanMode={togglePlanMode}
        onToggleThinkingMode={toggleThinkingMode}
        statusText={statusText}
        statusType={statusType}
      />
    </div>
  );
};

export default ChatContainer;
