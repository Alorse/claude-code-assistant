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
  firstUserMessage: string;
  messageCount: number;
  totalCost?: number;
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
      console.log("No conversation to save or missing start time");
      return;
    }

    try {
      console.log(
        `Attempting to save conversation to directory: ${this.conversationsDir}`,
      );
      // Create conversations directory if it doesn't exist
      if (!fs.existsSync(this.conversationsDir)) {
        console.log(
          `Directory does not exist, creating: ${this.conversationsDir}`,
        );
        fs.mkdirSync(this.conversationsDir, { recursive: true });
        console.log(`Directory created successfully`);
      }

      // Generate filename based on start time
      const timestamp = new Date(this.conversationStartTime)
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .substring(0, 19);

      const filename = `conversation_${timestamp}.json`;
      const filepath = path.join(this.conversationsDir, filename);
      console.log(`Full file path for saving: ${filepath}`);

      // Create conversation data
      const conversationData: ConversationData = {
        sessionId: sessionId || this.getSessionId(),
        filename,
        startTime: this.conversationStartTime,
        lastUserMessage: userMessage || this.getLastUserMessage(),
        firstUserMessage: this.getFirstUserMessage(),
        messageCount: this.currentConversation.length,
        // totalCost: this.getTotalCost(),
        messages: this.currentConversation,
      };

      // Save conversation file
      try {
        const dataToWrite = JSON.stringify(conversationData, null, 2);
        fs.writeFileSync(filepath, dataToWrite, "utf8");

        // Verify file was written
        if (!fs.existsSync(filepath)) {
          console.error(`ERROR: File was not created at ${filepath}`);
        }
      } catch (writeError) {
        console.error(`Failed to write file ${filepath}:`, writeError);
        throw writeError; // Re-throw to be caught by the outer try-catch
      }

      // Update index
      this.updateConversationIndex(conversationData);

      console.log(`Conversation saved successfully: ${filepath}`);
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

  getConversationBySessionId(sessionId: string): ConversationData | null {
    return (
      this.conversationIndex.find((conv) => conv.sessionId === sessionId) ||
      null
    );
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

    // Save to global state
    this.context.globalState.update("claude.draftMessage", message);
  }

  setCurrentSessionId(sessionId: string): void {
    if (this.currentConversationData) {
      this.currentConversationData.sessionId = sessionId;
    }
  }

  restoreDraftMessage(): string {
    const draft = this.context.globalState.get<string>(
      "claude.draftMessage",
      "",
    );
    this.draftMessage = draft;
    return draft;
  }

  private loadConversationIndex(): void {
    try {
      // First try to load from global state
      this.conversationIndex = this.context.globalState.get(
        "claude.conversationIndex",
        [],
      );

      // If no conversations in index, try to load from disk
      if (
        this.conversationIndex.length === 0 &&
        fs.existsSync(this.conversationsDir)
      ) {
        console.log(
          `Scanning directory for conversation files: ${this.conversationsDir}`,
        );
        const files = fs.readdirSync(this.conversationsDir);

        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const filepath = path.join(this.conversationsDir, file);
              const data = fs.readFileSync(filepath, "utf8");
              const conversation = JSON.parse(data);
              this.conversationIndex.push(conversation);
            } catch (error) {
              console.error(`Error loading conversation from ${file}:`, error);
            }
          }
        }

        // Save the index to global state for next time
        if (this.conversationIndex.length > 0) {
          this.context.globalState.update(
            "claude.conversationIndex",
            this.conversationIndex,
          );
        }
      }

      // Also restore draft message
      this.restoreDraftMessage();
    } catch (error) {
      console.error("Failed to load conversation index:", error);
      this.conversationIndex = [];
    }
  }

  private getSessionId(): string {
    const userMessages = this.currentConversation
      .filter((msg) => msg.type === "sessionInfo")
      .map((msg) => msg.data.sessionId);

    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : "";
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

    // Save to global state
    this.context.globalState.update(
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

  private getFirstUserMessage(): string {
    const userMessages = this.currentConversation
      .filter((msg) => msg.type === "userInput")
      .map((msg) => msg.data);

    return userMessages.length > 0 ? userMessages[0] : "";
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
