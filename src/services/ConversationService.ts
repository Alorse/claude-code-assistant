import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface ConversationMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface ConversationData {
  sessionId: string;
  filename: string;
  startTime: string;
  lastUserMessage: string;
  messages: ConversationMessage[];
}

export class ConversationService {
  private currentConversation: ConversationMessage[] = [];
  private conversationStartTime?: string;
  private conversationIndex: ConversationData[] = [];
  private draftMessage = "";
  private currentConversationData: ConversationData | undefined;

  constructor(
    private context: vscode.ExtensionContext,
    private conversationsDir: string,
  ) {
    this.loadConversationIndex();
  }

  addMessage(message: { type: string; data: any }): void {
    // Initialize conversation if this is the first message
    if (this.currentConversation.length === 0) {
      this.conversationStartTime = new Date().toISOString();
    }

    const conversationMessage: ConversationMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    this.currentConversation.push(conversationMessage);

    // Auto-save conversation periodically
    this.debouncedSaveConversation();
  }

  saveConversation(sessionId?: string, userMessage?: string): void {
    if (this.currentConversation.length === 0 || !this.conversationStartTime) {
      return;
    }

    try {
      // Create conversations directory if it doesn't exist
      if (!fs.existsSync(this.conversationsDir)) {
        fs.mkdirSync(this.conversationsDir, { recursive: true });
      }

      // Generate filename based on start time
      const timestamp = new Date(this.conversationStartTime)
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .substring(0, 19);

      const filename = `conversation_${timestamp}.json`;
      const filepath = path.join(this.conversationsDir, filename);

      // Create conversation data
      const conversationData: ConversationData = {
        sessionId: sessionId || "unknown",
        filename,
        startTime: this.conversationStartTime,
        lastUserMessage: userMessage || this.getLastUserMessage(),
        messages: this.currentConversation,
      };

      // Save conversation file
      fs.writeFileSync(filepath, JSON.stringify(conversationData, null, 2));

      // Update index
      this.updateConversationIndex(conversationData);

      console.log(`Conversation saved: ${filename}`);
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  }

  loadConversation(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const filepath = path.join(this.conversationsDir, filename);

        if (!fs.existsSync(filepath)) {
          reject(new Error(`Conversation file not found: ${filename}`));
          return;
        }

        const data = fs.readFileSync(filepath, "utf8");
        const conversationData: ConversationData = JSON.parse(data);

        // Replace current conversation
        this.currentConversation = conversationData.messages || [];
        this.conversationStartTime = conversationData.startTime;
        this.currentConversationData = conversationData;

        console.log(`Loaded conversation: ${filename}`);
        resolve();
      } catch (error) {
        console.error("Failed to load conversation:", error);
        reject(error);
      }
    });
  }

  getLatestConversation(): ConversationData | null {
    if (this.conversationIndex.length === 0) {
      return null;
    }

    // Sort by start time and return the latest
    return this.conversationIndex.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )[0];
  }

  getConversationList(): ConversationData[] {
    return this.conversationIndex.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }

  clearCurrentConversation(): void {
    this.currentConversation = [];
    this.conversationStartTime = undefined;
    this.currentConversationData = undefined;
  }

  getCurrentConversation(): ConversationMessage[] {
    return this.currentConversation;
  }

  getCurrentConversationData(): ConversationData | undefined {
    return this.currentConversationData;
  }

  getDraftMessage(): string {
    return this.draftMessage;
  }

  setDraftMessage(message: string): void {
    this.draftMessage = message;

    // Save to workspace state
    this.context.workspaceState.update("claude.draftMessage", message);
  }

  restoreDraftMessage(): string {
    const draft = this.context.workspaceState.get<string>(
      "claude.draftMessage",
      "",
    );
    this.draftMessage = draft;
    return draft;
  }

  private loadConversationIndex(): void {
    try {
      this.conversationIndex = this.context.workspaceState.get(
        "claude.conversationIndex",
        [],
      );

      // Also restore draft message
      this.restoreDraftMessage();
    } catch (error) {
      console.error("Failed to load conversation index:", error);
      this.conversationIndex = [];
    }
  }

  private updateConversationIndex(conversationData: ConversationData): void {
    // Remove existing entry with same filename
    this.conversationIndex = this.conversationIndex.filter(
      (conv) => conv.filename !== conversationData.filename,
    );

    // Add new entry
    this.conversationIndex.push(conversationData);

    // Keep only last 50 conversations
    if (this.conversationIndex.length > 50) {
      this.conversationIndex = this.conversationIndex
        .sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        )
        .slice(0, 50);
    }

    // Save to workspace state
    this.context.workspaceState.update(
      "claude.conversationIndex",
      this.conversationIndex,
    );
  }

  private getLastUserMessage(): string {
    const userMessages = this.currentConversation
      .filter((msg) => msg.type === "userInput")
      .map((msg) => msg.data);

    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : "";
  }

  private saveTimeout?: NodeJS.Timeout;

  private debouncedSaveConversation(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveConversation();
    }, 2000); // Save 2 seconds after last message
  }
}
