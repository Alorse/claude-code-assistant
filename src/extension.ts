import * as vscode from "vscode";
import { ClaudeAssistantProvider } from "./core/ClaudeAssistantProvider";
import { ClaudeAssistantWebviewProvider } from "./webview/ClaudeAssistantWebviewProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("Claude Code Assistant extension is being activated!");

  // Create the main assistant provider
  const assistantProvider = new ClaudeAssistantProvider(
    context.extensionUri,
    context,
  );

  // Register command to open chat
  const openChatDisposable = vscode.commands.registerCommand(
    "claude-code-assistant.openChat",
    (column?: vscode.ViewColumn) => {
      console.log("Claude Code Assistant command executed!");
      assistantProvider.show(column);
    },
  );

  // Register command to load conversation
  const loadConversationDisposable = vscode.commands.registerCommand(
    "claude-code-assistant.loadConversation",
    (filename: string) => {
      assistantProvider.loadConversation(filename);
    },
  );

  // Register webview view provider for sidebar chat
  const webviewProvider = new ClaudeAssistantWebviewProvider(
    context.extensionUri,
    context,
    assistantProvider,
  );
  vscode.window.registerWebviewViewProvider(
    "claude-code-assistant.chat",
    webviewProvider,
  );

  // Listen for configuration changes
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("claudeCodeAssistant.wsl")) {
        console.log("WSL configuration changed, starting new session");
        assistantProvider.newSessionOnConfigChange();
      }
    },
  );

  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBarItem.text = "Claude";
  statusBarItem.tooltip = "Open Claude Code Assistant (Ctrl+Shift+C)";
  statusBarItem.command = "claude-code-assistant.openChat";
  statusBarItem.show();

  context.subscriptions.push(
    openChatDisposable,
    loadConversationDisposable,
    configChangeDisposable,
    statusBarItem,
  );

  console.log(
    "Claude Code Assistant extension activation completed successfully!",
  );
}

export function deactivate() {
  console.log("Claude Code Assistant extension is being deactivated");
}
