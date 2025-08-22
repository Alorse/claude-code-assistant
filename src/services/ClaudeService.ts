import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";

export interface ClaudeMessage {
  type:
    | "userInput"
    | "output"
    | "error"
    | "loading"
    | "clearLoading"
    | "setProcessing"
    | "toolUse"
    | "toolResult"
    | "thinking"
    | "sessionInfo"
    | "updateTokens";
  data?: any;
}

export interface SessionInfo {
  sessionId: string;
  tools?: any[];
  mcpServers?: any[];
}

export interface ProcessingOptions {
  planMode?: boolean;
  thinkingMode?: boolean;
  selectedModel?: string;
}

export class ClaudeService {
  private currentProcess?: cp.ChildProcess;
  private currentSessionId?: string;
  private isProcessing = false;
  private totalTokensInput = 0;
  private totalTokensOutput = 0;

  constructor(
    private messageHandler: (message: ClaudeMessage) => void,
    private workspacePath: string,
    private mcpConfigPath?: string,
  ) {}

  async sendMessage(
    message: string,
    options: ProcessingOptions = {},
  ): Promise<void> {
    if (this.isProcessing) {
      throw new Error("Claude is already processing a message");
    }

    this.isProcessing = true;

    try {
      // Prepare message with mode prefixes
      const actualMessage = this.prepareMessage(message, options);

      // Send user input to UI
      this.messageHandler({
        type: "userInput",
        data: message,
      });

      // Set processing state
      this.messageHandler({
        type: "setProcessing",
        data: { isProcessing: true },
      });

      // Execute Claude command
      await this.executeClaudeCommand(actualMessage, options);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isProcessing = false;
      this.messageHandler({
        type: "setProcessing",
        data: { isProcessing: false },
      });
    }
  }

  private prepareMessage(message: string, options: ProcessingOptions): string {
    let actualMessage = message;

    // Add plan mode prefix
    if (options.planMode) {
      actualMessage =
        "PLAN FIRST FOR THIS MESSAGE ONLY: Plan first before making any changes. Show me in detail what you will change and wait for my explicit approval in a separate message before proceeding. Do not implement anything until I confirm. This planning requirement applies ONLY to this current message. \n\n" +
        message;
    }

    // Add thinking mode prefix
    if (options.thinkingMode) {
      const config = vscode.workspace.getConfiguration("claudeCodeChat");
      const thinkingIntensity = config.get<string>(
        "thinking.intensity",
        "think",
      );

      let thinkingPrompt = "THINK";
      switch (thinkingIntensity) {
        case "think-hard":
          thinkingPrompt = "THINK HARD";
          break;
        case "think-harder":
          thinkingPrompt = "THINK HARDER";
          break;
        case "ultrathink":
          thinkingPrompt = "ULTRATHINK";
          break;
      }

      actualMessage =
        thinkingPrompt + " THROUGH THIS STEP BY STEP: \n" + actualMessage;
    }

    return actualMessage;
  }

  private async executeClaudeCommand(
    message: string,
    options: ProcessingOptions,
  ): Promise<void> {
    const args = this.buildClaudeArgs(options);
    const claudeProcess = this.spawnClaudeProcess(args);

    if (!claudeProcess) {
      throw new Error("Failed to start Claude process");
    }

    this.currentProcess = claudeProcess;

    // Send message to Claude's stdin
    if (claudeProcess.stdin) {
      claudeProcess.stdin.write(message + "\n");
      claudeProcess.stdin.end();
    }

    // Set up output handlers
    this.setupProcessHandlers(claudeProcess);
  }

  private buildClaudeArgs(options: ProcessingOptions): string[] {
    const args = ["-p", "--output-format", "stream-json", "--verbose"];

    // Get configuration
    const config = vscode.workspace.getConfiguration("claudeCodeChat");
    const yoloMode = config.get<boolean>("permissions.yoloMode", false);

    if (yoloMode) {
      args.push("--dangerously-skip-permissions");
    } else {
      // Add MCP configuration for permissions
      const mcpConfigPath = this.getMCPConfigPath();
      if (mcpConfigPath) {
        args.push("--mcp-config", mcpConfigPath);
        args.push(
          "--allowedTools",
          "mcp__claude-code-chat-permissions__approval_prompt",
        );
        args.push(
          "--permission-prompt-tool",
          "mcp__claude-code-chat-permissions__approval_prompt",
        );
      }
    }

    // Add model selection
    if (options.selectedModel && options.selectedModel !== "default") {
      args.push("--model", options.selectedModel);
    }

    // Add session resume
    if (this.currentSessionId) {
      args.push("--resume", this.currentSessionId);
      console.log("Resuming session:", this.currentSessionId);
    } else {
      console.log("Starting new session");
    }

    return args;
  }

  private spawnClaudeProcess(args: string[]): cp.ChildProcess | null {
    const config = vscode.workspace.getConfiguration("claudeCodeChat");
    const wslEnabled = config.get<boolean>("wsl.enabled", false);
    const claudeCommand = this.getClaudeCommand();

    const commonOptions = {
      cwd: this.workspacePath,
      stdio: ["pipe", "pipe", "pipe"] as const,
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        NO_COLOR: "1",
      },
    };

    if (wslEnabled) {
      return this.spawnWSLProcess(args, commonOptions);
    } else {
      return this.spawnNativeProcess(claudeCommand, args, commonOptions);
    }
  }

  private spawnWSLProcess(args: string[], options: any): cp.ChildProcess {
    const config = vscode.workspace.getConfiguration("claudeCodeChat");
    const wslDistro = config.get<string>("wsl.distro", "Ubuntu");
    const nodePath = config.get<string>("wsl.nodePath", "/usr/bin/node");
    const claudePath = config.get<string>(
      "wsl.claudePath",
      "/usr/local/bin/claude",
    );

    console.log("Using WSL configuration:", {
      wslDistro,
      nodePath,
      claudePath,
    });
    const wslCommand = `"${nodePath}" --no-warnings --enable-source-maps "${claudePath}" ${args.join(" ")}`;

    return cp.spawn(
      "wsl",
      ["-d", wslDistro, "bash", "-ic", wslCommand],
      options,
    );
  }

  private spawnNativeProcess(
    claudeCommand: string,
    args: string[],
    options: any,
  ): cp.ChildProcess {
    if (claudeCommand === "claude") {
      console.log("Using native Claude command");
      return cp.spawn("claude", args, {
        ...options,
        shell: process.platform === "win32",
      });
    } else {
      console.log("Using native CCR Code command");
      return cp.spawn("ccr", ["code", ...args], {
        ...options,
        shell: process.platform === "win32",
      });
    }
  }

  private setupProcessHandlers(claudeProcess: cp.ChildProcess): void {
    let rawOutput = "";
    let errorOutput = "";

    // Handle stdout with JSON streaming
    if (claudeProcess.stdout) {
      claudeProcess.stdout.on("data", (data) => {
        rawOutput += data.toString();

        // Process JSON stream line by line
        const lines = rawOutput.split("\n");
        rawOutput = lines.pop() || ""; // Keep incomplete line for next chunk

        for (const line of lines) {
          if (line.trim()) {
            try {
              console.log("Claude STDOUT line:", line);
              const jsonData = JSON.parse(line.trim());
              this.processJsonStreamData(jsonData);
            } catch (error) {
              console.log("Failed to parse JSON line:", line, error);
            }
          }
        }
      });
    }

    // Handle stderr
    if (claudeProcess.stderr) {
      claudeProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
    }

    // Handle process close
    claudeProcess.on("close", (code: number | null) => {
      console.log("Claude process closed with code:", code);
      this.handleProcessClose(code ?? 0, errorOutput);
    });

    // Handle process error
    claudeProcess.on("error", (error) => {
      console.log("Claude process error:", error.message);
      this.handleProcessError(error);
    });
  }

  private processJsonStreamData(jsonData: any): void {
    switch (jsonData.type) {
      case "system":
        if (jsonData.subtype === "init") {
          this.currentSessionId = jsonData.session_id;
          this.messageHandler({
            type: "sessionInfo",
            data: {
              sessionId: jsonData.session_id,
              tools: jsonData.tools || [],
              mcpServers: jsonData.mcp_servers || [],
            },
          });
        }
        break;

      // Claude CLI older/newer variants
      case "assistant":
        if (jsonData.message?.usage) {
          this.updateTokenUsage(jsonData.message.usage);
        }
        if (jsonData.message?.content) {
          for (const content of jsonData.message.content) {
            this.processMessageContent(content);
          }
        }
        break;

      case "user":
        if (jsonData.message?.content) {
          for (const content of jsonData.message.content) {
            this.processMessageContent(content);
          }
        }
        break;

      case "result":
        // End of turn; clear loading handled on process close as well
        // You can extend this to forward totals if present
        if (jsonData.session_id) {
          this.currentSessionId = jsonData.session_id;
          this.messageHandler({
            type: "sessionInfo",
            data: {
              sessionId: jsonData.session_id,
              tools: jsonData.tools || [],
              mcpServers: jsonData.mcp_servers || [],
            },
          });
        }
        break;

      case "message":
        if (jsonData.message?.usage) {
          this.updateTokenUsage(jsonData.message.usage);
        }

        if (jsonData.message?.content) {
          for (const content of jsonData.message.content) {
            this.processMessageContent(content);
          }
        }
        break;

      case "message_delta":
        if (jsonData.delta?.content) {
          for (const content of jsonData.delta.content) {
            this.processMessageContent(content);
          }
        }
        break;

      default:
        console.log("Unknown JSON stream data type:", jsonData.type);
    }
  }

  private processMessageContent(content: any): void {
    if (content.type === "text" && content.text?.trim()) {
      this.messageHandler({
        type: "output",
        data: content.text.trim(),
      });
    } else if (content.type === "thinking" && content.thinking?.trim()) {
      this.messageHandler({
        type: "thinking",
        data: content.thinking.trim(),
      });
    } else if (content.type === "tool_use") {
      this.handleToolUse(content);
    } else if (content.type === "tool_result") {
      this.handleToolResult(content);
    }
  }

  private handleToolUse(content: any): void {
    const toolInfo = `🔧 Executing: ${content.name}`;
    let toolInput = "";

    if (content.input) {
      if (content.name === "TodoWrite") {
        toolInput = `Todos: ${JSON.stringify(content.input.todos || [], null, 2)}`;
      } else {
        toolInput = JSON.stringify(content.input, null, 2);
      }
    }

    this.messageHandler({
      type: "toolUse",
      data: {
        toolInfo,
        toolInput,
        rawInput: content.input,
        toolName: content.name,
      },
    });
  }

  private handleToolResult(content: any): void {
    const isError = content.is_error || false;
    const resultContent =
      typeof content.content === "string"
        ? content.content
        : JSON.stringify(content.content);

    this.messageHandler({
      type: "toolResult",
      data: {
        content: resultContent,
        isError,
        toolUseId: content.tool_use_id,
        toolName: content.tool_name || "Unknown",
      },
    });
  }

  private updateTokenUsage(usage: any): void {
    this.totalTokensInput += usage.input_tokens || 0;
    this.totalTokensOutput += usage.output_tokens || 0;

    this.messageHandler({
      type: "updateTokens",
      data: {
        totalTokensInput: this.totalTokensInput,
        totalTokensOutput: this.totalTokensOutput,
        currentInputTokens: usage.input_tokens || 0,
        currentOutputTokens: usage.output_tokens || 0,
        cacheCreationTokens: usage.cache_creation_input_tokens || 0,
        cacheReadTokens: usage.cache_read_input_tokens || 0,
      },
    });
  }

  private handleProcessClose(code: number, errorOutput: string): void {
    this.currentProcess = undefined;
    this.isProcessing = false;

    this.messageHandler({
      type: "clearLoading",
    });

    if (code !== 0 && errorOutput.trim()) {
      this.messageHandler({
        type: "error",
        data: errorOutput.trim(),
      });
    }
  }

  private handleProcessError(error: Error): void {
    this.currentProcess = undefined;
    this.isProcessing = false;

    this.messageHandler({
      type: "clearLoading",
    });

    this.messageHandler({
      type: "error",
      data: `Error running Claude: ${error.message}`,
    });
  }

  private handleError(error: any): void {
    console.error("Claude service error:", error);
    this.messageHandler({
      type: "error",
      data: error.message || "Unknown error occurred",
    });

    this.messageHandler({
      type: "clearLoading",
    });
  }

  private getClaudeCommand(): string {
    const config = vscode.workspace.getConfiguration("claudeCodeChat");
    const configured = config.get<string>("claudeCommand", "ccr code");
    const valid = ["claude", "ccr code"];
    const cmd = valid.includes(configured) ? configured : "ccr code";
    console.log("Selected Claude command:", cmd);
    return cmd;
  }

  private getMCPConfigPath(): string | null {
    return this.mcpConfigPath || null;
  }

  public stopCurrentProcess(): void {
    if (this.currentProcess) {
      console.log("Terminating Claude process...");
      this.currentProcess.kill("SIGTERM");
      this.currentProcess = undefined;
      this.isProcessing = false;

      // Clear session ID to ensure fresh start
      this.currentSessionId = undefined;

      this.messageHandler({
        type: "error",
        data: "⏹️ Claude code was stopped.",
      });
    }
  }

  public getCurrentSessionId(): string | undefined {
    return this.currentSessionId;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }
}
