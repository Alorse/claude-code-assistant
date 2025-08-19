// VS Code API message types

export interface VSCodeMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

// Extension to webview messages
export interface ReadyMessage extends VSCodeMessage {
  type: "ready";
  data: string;
}

export interface UserInputMessage extends VSCodeMessage {
  type: "userInput";
  data: string;
}

export interface OutputMessage extends VSCodeMessage {
  type: "output";
  data: string;
}

export interface ErrorMessage extends VSCodeMessage {
  type: "error";
  data: string;
}

export interface LoadingMessage extends VSCodeMessage {
  type: "loading";
  data: string;
}

export interface ClearLoadingMessage extends VSCodeMessage {
  type: "clearLoading";
}

export interface ProcessingMessage extends VSCodeMessage {
  type: "setProcessing";
  data: {
    isProcessing: boolean;
    requestStartTime?: number;
  };
}

export interface ModelSelectedMessage extends VSCodeMessage {
  type: "modelSelected";
  model: string;
}

export interface RestoreInputMessage extends VSCodeMessage {
  type: "restoreInputText";
  data: string;
}

export interface SessionClearedMessage extends VSCodeMessage {
  type: "sessionCleared";
}

export interface PlatformInfoMessage extends VSCodeMessage {
  type: "platformInfo";
  data: {
    platform: string;
    isWindows: boolean;
    wslAlertDismissed: boolean;
    wslEnabled: boolean;
  };
}

export interface SettingsDataMessage extends VSCodeMessage {
  type: "settingsData";
  data: Record<string, any>;
}

// Webview to extension messages
export interface SendMessageRequest extends VSCodeMessage {
  type: "sendMessage";
  text: string;
  planMode?: boolean;
  thinkingMode?: boolean;
}

export interface NewSessionRequest extends VSCodeMessage {
  type: "newSession";
}

export interface SaveInputTextRequest extends VSCodeMessage {
  type: "saveInputText";
  text: string;
}

export interface GetSettingsRequest extends VSCodeMessage {
  type: "getSettings";
}

export interface GetConversationListRequest extends VSCodeMessage {
  type: "getConversationList";
}

export interface SelectImageFileRequest extends VSCodeMessage {
  type: "selectImageFile";
}

export interface GetWorkspaceFilesRequest extends VSCodeMessage {
  type: "getWorkspaceFiles";
  searchTerm?: string;
}

export interface LoadMCPServersRequest extends VSCodeMessage {
  type: "loadMCPServers";
}

export interface DismissWSLAlertRequest extends VSCodeMessage {
  type: "dismissWSLAlert";
}

export interface SelectModelRequest extends VSCodeMessage {
  type: "selectModel";
  model?: string;
}

// Union types for type safety
export type ExtensionToWebviewMessage =
  | ReadyMessage
  | UserInputMessage
  | OutputMessage
  | ErrorMessage
  | LoadingMessage
  | ClearLoadingMessage
  | ProcessingMessage
  | ModelSelectedMessage
  | RestoreInputMessage
  | SessionClearedMessage
  | PlatformInfoMessage
  | SettingsDataMessage;

export type WebviewToExtensionMessage =
  | SendMessageRequest
  | NewSessionRequest
  | SaveInputTextRequest
  | GetSettingsRequest
  | GetConversationListRequest
  | SelectImageFileRequest
  | GetWorkspaceFilesRequest
  | LoadMCPServersRequest
  | DismissWSLAlertRequest
  | SelectModelRequest;
