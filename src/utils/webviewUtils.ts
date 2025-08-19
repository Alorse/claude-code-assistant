import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

export function getHtmlForWebview(
  isTelemetryEnabled?: boolean,
  extensionPath?: string,
  webview?: vscode.Webview,
): string {
  // Try to load the built React app
  if (extensionPath && webview) {
    try {
      const webviewDistPath = path.join(extensionPath, "webview-ui", "dist");
      const indexPath = path.join(webviewDistPath, "index.html");

      if (fs.existsSync(indexPath)) {
        let htmlContent = fs.readFileSync(indexPath, "utf8");

        // Get the proper URI for webview resources
        const assetsUri = webview.asWebviewUri(
          vscode.Uri.file(path.join(webviewDistPath, "assets")),
        );

        // Replace relative paths with webview-safe URIs
        htmlContent = htmlContent.replace(
          /src="\/assets\//g,
          `src="${assetsUri}/`,
        );
        htmlContent = htmlContent.replace(
          /href="\/assets\//g,
          `href="${assetsUri}/`,
        );

        return htmlContent;
      }
    } catch (error) {
      console.error(
        "Failed to load React webview, falling back to simple HTML:",
        error,
      );
    }
  }

  // Fallback to simple HTML implementation
  return getSimpleHtmlForWebview(isTelemetryEnabled);
}

function getSimpleHtmlForWebview(isTelemetryEnabled?: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Claude Code Assistant</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			background-color: transparent;
			color: var(--vscode-editor-foreground);
			margin: 0;
			padding: 20px;
			height: 100vh;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		.loading {
			text-align: center;
		}
		.spinner {
			border: 2px solid var(--vscode-panel-border);
			border-top: 2px solid var(--vscode-button-background);
			border-radius: 50%;
			width: 40px;
			height: 40px;
			animation: spin 1s linear infinite;
			margin: 0 auto 20px;
		}
		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	</style>
</head>
<body>
	<div class="loading">
		<div class="spinner"></div>
		<h2>Loading Claude Code Assistant...</h2>
		<p>Please wait while the interface initializes.</p>
	</div>
	
	<script>
		const vscode = acquireVsCodeApi();
		
		// Simple message handling for fallback mode
		window.addEventListener('message', event => {
			const message = event.data;
			console.log('Fallback mode received message:', message);
		});
		
		// Notify extension that webview is ready
		vscode.postMessage({ type: 'webviewReady' });
	</script>
</body>
</html>`;
}
