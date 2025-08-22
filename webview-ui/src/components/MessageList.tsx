import React, { memo, useRef, useEffect } from "react";
import LoadingVerb from "./LoadingVerb";
import MessageItem from "./MessageItem";
import ToolUseMessage from "./ToolUseMessage";
import ToolResultMessage from "./ToolResultMessage";
import PermissionRequest from "./PermissionRequest";
import { CLAUDE_CODE_COLOR } from "../utils/constants";
import { useVSCode } from "../context/VSCodeContext";

import { UIMessage } from "../utils/messageTypes";

type Message = UIMessage;

interface MessageListProps {
  messages: Message[];
  isProcessing?: boolean;
}

const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, isProcessing }) => {
    const { postMessage } = useVSCode();
    if (messages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-description">
            <h3 className="text-lg font-medium text-foreground mb-2">
              <span>
                <span style={{ color: "#DE7356" }}>✻</span> Welcome to Claude
                Code Assistant!
              </span>
            </h3>
            <p className="text-sm">
              /help for help, /status for your current setup, ? for shortcuts
            </p>
          </div>
        </div>
      );
    }

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        ref={messagesEndRef}
      >
        {messages.map((message) => {
          // console.log("message < HERE >", message);
          if (message.type === "tool") {
            return <ToolUseMessage data={message.content} />;
          }

          if (message.type === "tool-result") {
            return <ToolResultMessage data={message.content} />;
          }

          if (message.type === "permission-request") {
            // Only show the PermissionRequest if it's the last message
            const currentIdx = messages.findIndex((m) => m.id === message.id);
            const isLast = currentIdx === messages.length - 1;
            if (!isLast) return null;
            const d = message.content as any;
            return (
              <PermissionRequest
                key={message.id}
                id={d.id}
                tool={d.tool}
                pattern={d.pattern}
                onRespond={(id, approved, alwaysAllow) => {
                  // send response back to extension
                  postMessage({
                    type: "permissionResponse",
                    id,
                    approved,
                    alwaysAllow: !!alwaysAllow,
                  });
                }}
              />
            );
          }

          return <MessageItem key={message.id} message={message} />;
        })}
        {isProcessing && (
          <div className="px-2" style={{ color: CLAUDE_CODE_COLOR }}>
            <LoadingVerb running />
          </div>
        )}
      </div>
    );
  },
);

MessageList.displayName = "MessageList";

export default MessageList;
