import React from 'react';

interface HeaderProps {
  onNewSession: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewSession, onOpenSettings, onOpenHistory }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-border bg-panel-background">
      <div className="flex items-center">
        <h2 className="text-base font-medium text-foreground tracking-tight">
          Claude Code Assistant
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="vscode-button-outlined"
          title="Settings"
        >
          ⚙️
        </button>
        
        <button
          onClick={onOpenHistory}
          className="vscode-button-outlined"
          title="Conversation History"
        >
          📚 History
        </button>
        
        <button
          onClick={onNewSession}
          className="vscode-button"
          title="Start New Chat"
        >
          New Chat
        </button>
      </div>
    </div>
  );
};

export default Header;
