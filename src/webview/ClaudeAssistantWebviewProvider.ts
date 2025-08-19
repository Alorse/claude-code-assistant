import * as vscode from "vscode";
import { ClaudeAssistantProvider } from "../core/ClaudeAssistantProvider";

export class ClaudeAssistantWebviewProvider
  implements vscode.WebviewViewProvider
{
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
    private readonly assistantProvider: ClaudeAssistantProvider,
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    // Use the shared assistant provider instance for the sidebar
    this.assistantProvider.showInWebview(webviewView.webview, webviewView);

    // Handle visibility changes to reinitialize when sidebar reopens
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Close main panel when sidebar becomes visible
        if (this.assistantProvider.getPanel()) {
          console.log("Closing main panel because sidebar became visible");
          this.assistantProvider.getPanel()?.dispose();
          this.assistantProvider.clearPanel();
        }
        this.assistantProvider.reinitializeWebview();
      }
    });
  }
}
