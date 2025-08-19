import React, { useState, useEffect, useRef } from "react";
import { useVSCode } from "../context/VSCodeContext";
import Header from "./Header";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import StatusBar from "./StatusBar";

interface Message {
  id: string;
  type: "user" | "claude" | "error" | "system";
  content: string;
  timestamp: string;
}

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
          break;

        case "error":
          addMessage("error", message.data);
          setStatusType("error");
          break;

        case "loading":
          setStatusText(message.data);
          setStatusType("processing");
          setShowLoadingVerb(true);
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

  const newSession = () => {
    postMessage({ type: "newSession" });
    setStatusText("Starting new session...");
    setStatusType("processing");
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

  const openSettings = () => {
    postMessage({ type: "getSettings" });
    // TODO: Implement settings modal
  };

  const openHistory = () => {
    postMessage({ type: "getConversationList" });
    // TODO: Implement history modal
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
      <Header
        onNewSession={newSession}
        onOpenSettings={openSettings}
        onOpenHistory={openHistory}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={chatState.messages} isProcessing={statusType === "processing"} />
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
