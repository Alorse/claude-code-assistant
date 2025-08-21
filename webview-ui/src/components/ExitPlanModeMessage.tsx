import React from "react";
import MessageItem from "./MessageItem";

interface ExitPlanModeMessageProps {
  data: {
    toolInfo?: string;
    toolName?: string;
    rawInput?: {
      plan: string;
    };
    toolInput?: string;
  };
}

const ExitPlanModeMessage: React.FC<ExitPlanModeMessageProps> = ({ data }) => {
  const plan = data.rawInput?.plan || data.toolInput || "";

  // Create a message object that MessageItem can handle
  const message = {
    id: `plan-${Date.now()}`,
    type: "claude" as const,
    content: plan,
    timestamp: new Date().toISOString(),
  };

  return <MessageItem message={message} />;
};

export default ExitPlanModeMessage;
