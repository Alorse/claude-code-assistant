import * as vscode from "vscode";
import * as cp from "child_process";
import * as util from "util";
import * as path from "path";
import { getHtmlForWebview } from "../utils/webviewUtils";
import { getValidModelValues, getModelByValue } from "../utils/models";
import { ClaudeService } from "../services/ClaudeService";
import { ConversationService } from "../services/ConversationService";
import { BackupService } from "../services/BackupService";

const exec = util.promisify(cp.exec);

interface ConversationData {
  sessionId: string;
  startTime: string | undefined;
  endTime: string;
  messageCount: number;
  totalCost: number;
  totalTokens: {
    input: number;
    output: number;
  };
  messages: Array<{ timestamp: string; messageType: string; data: any }>;
  filename: string;
}

export class ClaudeAssistantProvider {
  private panel: vscode.WebviewPanel | undefined;
  private webview: vscode.Webview | undefined;
  private webviewView: vscode.WebviewView | undefined;
  private disposables: vscode.Disposable[] = [];
  private messageHandlerDisposable: vscode.Disposable | undefined;

  // Session state
  private currentSessionId: string | undefined;
  private conversationIndex: Array<{
    filename: string;
    sessionId: string;
    startTime: string;
    endTime: string;
    messageCount: number;
    totalCost: number;
    firstUserMessage: string;
    lastUserMessage: string;
  }> = [];
  private selectedModel: string = "default";
  private draftMessage: string = "";

  private claudeService?: ClaudeService;
  private conversationService?: ConversationService;
  private backupService?: BackupService;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
  ) {
    // Initialize backup repository and conversations
    this.initializeBackupRepo();
    this.initializeConversations();
    this.initializeMCPConfig();

    // Load conversation index from workspace state
    this.conversationIndex = this.context.workspaceState.get(
      "claude.conversationIndex",
      [],
    );

    // Load saved model preference
    this.selectedModel = this.context.workspaceState.get(
      "claude.selectedModel",
      "default",
    );

    // Initialize services
    this.initializeServices();

    // Resume session from latest conversation
    const latestConversation = this.getLatestConversation();
    this.currentSessionId = latestConversation?.sessionId;
  }

  private initializeServices(): void {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const workspacePath = workspaceFolder
      ? workspaceFolder.uri.fsPath
      : process.cwd();
    const conversationsDir = path.join(
      workspacePath,
      ".claude",
      "conversations",
    );

    // Initialize conversation service
    this.conversationService = new ConversationService(
      this.context,
      conversationsDir,
    );

    // Initialize backup service
    this.backupService = new BackupService(workspacePath, (message) => {
      this.sendAndSaveMessage(message);
    });

    // Initialize Claude service
    this.claudeService = new ClaudeService((message) => {
      this.sendAndSaveMessage(message);
    }, workspacePath);
  }

  public getPanel(): vscode.WebviewPanel | undefined {
    return this.panel;
  }

  public clearPanel(): void {
    this.panel = undefined;
  }

  public show(column: vscode.ViewColumn | vscode.Uri = vscode.ViewColumn.Two) {
    // Handle case where a URI is passed instead of ViewColumn
    const actualColumn =
      column instanceof vscode.Uri ? vscode.ViewColumn.Two : column;

    // Close sidebar if it's open
    this.closeSidebar();

    if (this.panel) {
      this.panel.reveal(actualColumn);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "claudeAssistant",
      "Claude Code Assistant",
      actualColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.extensionUri],
      },
    );

    // Set icon for the webview tab using URI path
    const iconPath = vscode.Uri.joinPath(this.extensionUri, "icon.png");
    this.panel.iconPath = iconPath;

    this.panel.webview.html = getHtmlForWebview(
      vscode.env?.isTelemetryEnabled,
      this.extensionUri.fsPath,
      this.panel.webview,
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.setupWebviewMessageHandler(this.panel.webview);
    this.initializePermissions();

    // Resume session from latest conversation
    const latestConversation = this.getLatestConversation();
    this.currentSessionId = latestConversation?.sessionId;

    // Load latest conversation history if available
    if (latestConversation) {
      this.loadConversationHistory(latestConversation.filename);
    }

    // Send ready message immediately
    setTimeout(() => {
      // If no conversation to load, send ready immediately
      if (!latestConversation) {
        this.sendReadyMessage();
      }
    }, 100);
  }

  public showInWebview(
    webview: vscode.Webview,
    webviewView?: vscode.WebviewView,
  ) {
    // Close main panel if it's open
    if (this.panel) {
      console.log("Closing main panel because sidebar is opening");
      this.panel.dispose();
      this.panel = undefined;
    }

    this.webview = webview;
    this.webviewView = webviewView;
    this.webview.html = getHtmlForWebview(
      vscode.env?.isTelemetryEnabled,
      this.extensionUri.fsPath,
      this.webview,
    );

    this.setupWebviewMessageHandler(this.webview);
    this.initializePermissions();

    // Initialize the webview
    this.initializeWebview();
  }

  public reinitializeWebview() {
    // Only reinitialize if we have a webview (sidebar)
    if (this.webview) {
      this.initializePermissions();
      this.initializeWebview();
      // Set up message handler for the webview
      this.setupWebviewMessageHandler(this.webview);
    }
  }

  public loadConversation(filename: string): Promise<void> {
    // Load the conversation history
    return this.loadConversationHistory(filename);
  }

  public newSessionOnConfigChange() {
    // Reinitialize MCP config with new WSL paths
    this.initializeMCPConfig();

    // Start a new session due to configuration change
    this.newSession();

    // Show notification to user
    vscode.window.showInformationMessage(
      "WSL configuration changed. Started a new Claude session.",
      "OK",
    );

    // Send message to webview about the config change
    this.sendAndSaveMessage({
      type: "configChanged",
      data: "⚙️ WSL configuration changed. Started a new session.",
    });
  }

  // Private methods - simplified for this initial migration
  private async initializeBackupRepo(): Promise<void> {
    // Implementation from original - simplified for now
    console.log("Initializing backup repository...");
  }

  private async initializeConversations(): Promise<void> {
    // Implementation from original - simplified for now
    console.log("Initializing conversations...");
  }

  private async initializeMCPConfig(): Promise<void> {
    // Implementation from original - simplified for now
    console.log("Initializing MCP config...");
  }

  private async initializePermissions(): Promise<void> {
    // Implementation from original - simplified for now
    console.log("Initializing permissions...");
  }

  private initializeWebview() {
    // Resume session from latest conversation
    const latestConversation = this.getLatestConversation();
    this.currentSessionId = latestConversation?.sessionId;

    // Load latest conversation history if available
    if (latestConversation) {
      this.loadConversationHistory(latestConversation.filename);
    } else {
      // If no conversation to load, send ready immediately
      setTimeout(() => {
        this.sendReadyMessage();
      }, 100);
    }
  }

  private setupWebviewMessageHandler(webview: vscode.Webview) {
    // Dispose of any existing message handler
    if (this.messageHandlerDisposable) {
      this.messageHandlerDisposable.dispose();
    }

    // Set up new message handler
    this.messageHandlerDisposable = webview.onDidReceiveMessage(
      (message) => this.handleWebviewMessage(message),
      null,
      this.disposables,
    );
  }

  private handleWebviewMessage(message: any) {
    switch (message.type) {
      case "sendMessage":
        console.log("Handling sendMessage:", message.text);
        this.sendMessageToClaude(
          message.text,
          message.planMode,
          message.thinkingMode,
        );
        return;
      case "newSession":
        this.newSession();
        return;
      case "restoreCommit":
        this.restoreToCommit(message.commitSha);
        return;
      case "getConversationList":
        this.sendConversationList();
        return;
      case "getWorkspaceFiles":
        this.sendWorkspaceFiles(message.searchTerm);
        return;
      case "selectImageFile":
        this.selectImageFile();
        return;
      case "loadConversation":
        this.loadConversation(message.filename);
        return;
      case "stopRequest":
        this.stopClaudeProcess();
        return;
      case "getSettings":
        this.sendCurrentSettings();
        return;
      case "updateSettings":
        this.updateSettings(message.settings);
        return;
      case "getClipboardText":
        this.getClipboardText();
        return;
      case "selectModel":
        this.setSelectedModel(message.model);
        return;
      case "openModelTerminal":
        this.openModelTerminal();
        return;
      case "executeSlashCommand":
        this.executeSlashCommand(message.command);
        return;
      case "dismissWSLAlert":
        this.dismissWSLAlert();
        return;
      case "openFile":
        this.openFileInEditor(message.filePath);
        return;
      case "createImageFile":
        this.createImageFile(message.imageData, message.imageType);
        return;
      case "permissionResponse":
        this.handlePermissionResponse(
          message.id,
          message.approved,
          message.alwaysAllow,
        );
        return;
      case "getPermissions":
        this.sendPermissions();
        return;
      case "removePermission":
        this.removePermission(message.toolName, message.command);
        return;
      case "addPermission":
        this.addPermission(message.toolName, message.command);
        return;
      case "loadMCPServers":
        this.loadMCPServers();
        return;
      case "saveMCPServer":
        this.saveMCPServer(message.name, message.config);
        return;
      case "deleteMCPServer":
        this.deleteMCPServer(message.name);
        return;
      case "getCustomSnippets":
        this.sendCustomSnippets();
        return;
      case "saveCustomSnippet":
        this.saveCustomSnippet(message.snippet);
        return;
      case "deleteCustomSnippet":
        this.deleteCustomSnippet(message.snippetId);
        return;
      case "enableYoloMode":
        this.enableYoloMode();
        return;
      case "saveInputText":
        this.saveInputText(message.text);
        return;
    }
  }

  private sendAndSaveMessage(message: { type: string; data: any }): void {
    // Send to UI
    this.postMessage(message);

    // Save to conversation
    this.conversationService?.addMessage(message);
  }

  private async sendMessageToClaude(
    message: string,
    planMode?: boolean,
    thinkingMode?: boolean,
  ): Promise<void> {
    if (!this.claudeService) {
      throw new Error("Claude service not initialized");
    }

    try {
      // Create backup commit before sending
      if (this.backupService) {
        await this.backupService.createBackupCommit(message);
      }

      // Clear draft message
      this.draftMessage = "";
      this.conversationService?.setDraftMessage("");

      // Send message through Claude service
      await this.claudeService.sendMessage(message, {
        planMode,
        thinkingMode,
        selectedModel: this.selectedModel,
      });

      // Update session ID if we got one
      const sessionId = this.claudeService.getCurrentSessionId();
      if (sessionId && sessionId !== this.currentSessionId) {
        this.currentSessionId = sessionId;
      }

      // Save conversation with session ID
      this.conversationService?.saveConversation(
        this.currentSessionId,
        message,
      );

      // Refresh conversation index after saving
      this.refreshConversationIndex();
    } catch (error: any) {
      console.error("Error sending message to Claude:", error);
      this.sendAndSaveMessage({
        type: "error",
        data: `Failed to send message: ${error.message}`,
      });
    }
  }

  private newSession(): void {
    console.log("Starting new session");

    // Clear current session
    this.currentSessionId = undefined;

    // Clear conversation
    this.conversationService?.clearCurrentConversation();

    // Stop any current Claude process
    this.claudeService?.stopCurrentProcess();

    // Send session cleared message to UI
    this.postMessage({
      type: "sessionCleared",
    });

    // Send ready message
    this.sendReadyMessage();
  }

  private async restoreToCommit(commitSha: string): Promise<void> {
    console.log("Restoring to commit:", commitSha);

    try {
      if (!this.backupService) {
        throw new Error("Backup service not initialized");
      }

      await this.backupService.restoreFromCommit(commitSha);
    } catch (error: any) {
      console.error("Failed to restore commit:", error);
      vscode.window.showErrorMessage(
        `Failed to restore commit: ${error.message}`,
      );

      this.sendAndSaveMessage({
        type: "error",
        data: `Failed to restore: ${error.message}`,
      });
    }
  }

  private sendConversationList() {
    // Ensure entries include startTime, firstUserMessage, lastUserMessage
    const data = this.conversationIndex.map((c) => ({
      filename: c.filename,
      sessionId: c.sessionId,
      startTime: c.startTime,
      endTime: c.endTime,
      messageCount: c.messageCount,
      totalCost: c.totalCost,
      firstUserMessage: c.firstUserMessage,
      lastUserMessage: c.lastUserMessage,
    }));
    this.postMessage({ type: "conversationList", data });
  }

  // Public wrappers for commands
  public startNewSession(): void {
    this.newSession();
  }

  public showHistory(): void {
    // Refresh index before showing to ensure it's up to date
    this.refreshConversationIndex();
    this.sendConversationList();
  }

  public showSettings(): void {
    this.sendCurrentSettings();
  }

  private async sendWorkspaceFiles(searchTerm?: string) {
    console.log("Sending workspace files with search term:", searchTerm);
    // TODO: Implement workspace files logic
  }

  private async selectImageFile() {
    console.log("Selecting image file");
    // TODO: Implement image file selection
  }

  private async loadConversationHistory(filename: string): Promise<void> {
    try {
      if (!this.conversationService) {
        console.error("Conversation service not initialized");
        return;
      }

      await this.conversationService.loadConversation(filename);

      // Clear current UI and push loaded messages
      this.postMessage({ type: "sessionCleared" });

      const messages = this.conversationService.getCurrentConversation();
      for (const msg of messages) {
        // legacy format: { type, data }
        this.postMessage({ type: msg.type, data: msg.data });
      }

      // Send ready
      this.sendReadyMessage();
    } catch (e) {
      console.error("Failed to load conversation:", e);
      this.postMessage({ type: "error", data: "Failed to load conversation" });
    }
  }

  private stopClaudeProcess() {
    console.log("Stopping Claude process");
    // TODO: Implement stop logic
  }

  private sendCurrentSettings() {
    const config = vscode.workspace.getConfiguration("claudeCodeAssistant");
    const settings = {
      "thinking.intensity": config.get<string>("thinking.intensity", "think"),
      "wsl.enabled": config.get<boolean>("wsl.enabled", false),
      "wsl.distro": config.get<string>("wsl.distro", "Ubuntu"),
      "wsl.nodePath": config.get<string>("wsl.nodePath", "/usr/bin/node"),
      "wsl.claudePath": config.get<string>(
        "wsl.claudePath",
        "/usr/local/bin/claude",
      ),
      "permissions.yoloMode": config.get<boolean>(
        "permissions.yoloMode",
        false,
      ),
      claudeCommand: config.get<string>("claudeCommand", "ccr code"),
    };

    this.postMessage({
      type: "settingsData",
      data: settings,
    });
  }

  private async updateSettings(settings: { [key: string]: any }) {
    console.log("Updating settings:", settings);
    // TODO: Implement settings update logic
  }

  private async getClipboardText() {
    try {
      const text = await vscode.env.clipboard.readText();
      this.postMessage({
        type: "clipboardText",
        data: text,
      });
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }

  private setSelectedModel(model: string) {
    const validModels = getValidModelValues();
    if (validModels.includes(model)) {
      this.selectedModel = model;
      console.log("Model selected:", model);

      // Store the model preference in workspace state
      this.context.workspaceState.update("claude.selectedModel", model);

      // Notify webview of model change
      this.postMessage({
        type: "modelSelected",
        model: this.selectedModel,
      });

      // Show confirmation with proper label
      const modelConfig = getModelByValue(model);
      const displayName = modelConfig?.label || model;
    } else {
      console.error("Invalid model selected:", model);
      const availableModels = getValidModelValues().join(", ");
      vscode.window.showErrorMessage(
        `Invalid model: ${model}. Available models: ${availableModels}`,
      );
    }
  }

  private openModelTerminal() {
    console.log("Opening model terminal");
    // TODO: Implement model terminal logic
  }

  private executeSlashCommand(command: string) {
    console.log("Executing slash command:", command);
    // TODO: Implement slash command logic
  }

  private dismissWSLAlert() {
    this.context.globalState.update("wslAlertDismissed", true);
  }

  private async openFileInEditor(filePath: string) {
    try {
      const uri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
      console.error("Error opening file:", error);
    }
  }

  private async createImageFile(imageData: string, imageType: string) {
    console.log("Creating image file:", imageType);
    // TODO: Implement image file creation logic
  }

  private handlePermissionResponse(
    id: string,
    approved: boolean,
    alwaysAllow?: boolean,
  ) {
    console.log("Handling permission response:", { id, approved, alwaysAllow });
    // TODO: Implement permission response logic
  }

  private async sendPermissions() {
    console.log("Sending permissions");
    // TODO: Implement permissions sending logic
  }

  private async removePermission(toolName: string, command: string) {
    console.log("Removing permission:", { toolName, command });
    // TODO: Implement permission removal logic
  }

  private async addPermission(toolName: string, command: string) {
    console.log("Adding permission:", { toolName, command });
    // TODO: Implement permission addition logic
  }

  private async loadMCPServers() {
    console.log("Loading MCP servers");
    // TODO: Implement MCP server loading logic
  }

  private async saveMCPServer(name: string, config: any) {
    console.log("Saving MCP server:", { name, config });
    // TODO: Implement MCP server saving logic
  }

  private async deleteMCPServer(name: string) {
    console.log("Deleting MCP server:", name);
    // TODO: Implement MCP server deletion logic
  }

  private async sendCustomSnippets() {
    console.log("Sending custom snippets");
    // TODO: Implement custom snippets logic
  }

  private async saveCustomSnippet(snippet: any) {
    console.log("Saving custom snippet:", snippet);
    // TODO: Implement custom snippet saving logic
  }

  private async deleteCustomSnippet(snippetId: string) {
    console.log("Deleting custom snippet:", snippetId);
    // TODO: Implement custom snippet deletion logic
  }

  private async enableYoloMode() {
    try {
      // Update VS Code configuration to enable YOLO mode
      const config = vscode.workspace.getConfiguration("claudeCodeAssistant");

      // Clear any global setting and set workspace setting
      await config.update(
        "permissions.yoloMode",
        true,
        vscode.ConfigurationTarget.Workspace,
      );

      console.log("YOLO Mode enabled - all future permissions will be skipped");

      // Send updated settings to UI
      this.sendCurrentSettings();
    } catch (error) {
      console.error("Error enabling YOLO mode:", error);
    }
  }

  private saveInputText(text: string): void {
    this.draftMessage = text || "";
    this.conversationService?.setDraftMessage(text || "");
  }

  private closeSidebar() {
    if (this.webviewView) {
      // Switch VS Code to show Explorer view instead of chat sidebar
      vscode.commands.executeCommand("workbench.view.explorer");
    }
  }

  private sendReadyMessage() {
    this.postMessage({
      type: "ready",
      data: this.isProcessing
        ? "Claude is working..."
        : "Ready to chat with Claude Code! Type your message below.",
    });

    // Send current model to webview
    this.postMessage({
      type: "modelSelected",
      model: this.selectedModel,
    });

    // Send platform information to webview
    this.sendPlatformInfo();

    // Send current settings to webview
    this.sendCurrentSettings();

    // Send saved draft message if any
    if (this.draftMessage) {
      this.postMessage({
        type: "restoreInputText",
        data: this.draftMessage,
      });
    }
  }

  private sendPlatformInfo() {
    const platform = process.platform;
    const dismissed = this.context.globalState.get<boolean>(
      "wslAlertDismissed",
      false,
    );

    // Get WSL configuration
    const config = vscode.workspace.getConfiguration("claudeCodeAssistant");
    const wslEnabled = config.get<boolean>("wsl.enabled", false);

    this.postMessage({
      type: "platformInfo",
      data: {
        platform: platform,
        isWindows: platform === "win32",
        wslAlertDismissed: dismissed,
        wslEnabled: wslEnabled,
      },
    });
  }

  private postMessage(message: any) {
    if (this.panel && this.panel.webview) {
      this.panel.webview.postMessage(message);
    } else if (this.webview) {
      this.webview.postMessage(message);
    }
  }

  private getLatestConversation(): any | undefined {
    return this.conversationIndex.length > 0
      ? this.conversationIndex[0]
      : undefined;
  }

  private refreshConversationIndex(): void {
    // Reload conversation index from workspace state to pick up new conversations
    this.conversationIndex = this.context.workspaceState.get(
      "claude.conversationIndex",
      [],
    );
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }

    // Dispose message handler if it exists
    if (this.messageHandlerDisposable) {
      this.messageHandlerDisposable.dispose();
      this.messageHandlerDisposable = undefined;
    }

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
