import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// VS Code API types
interface VSCodeAPI {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}

interface VSCodeContextType {
  vscode: VSCodeAPI | null;
  postMessage: (message: any) => void;
  isReady: boolean;
}

const VSCodeContext = createContext<VSCodeContextType | undefined>(undefined);

export const useVSCode = () => {
  const context = useContext(VSCodeContext);
  if (context === undefined) {
    throw new Error('useVSCode must be used within a VSCodeProvider');
  }
  return context;
};

interface VSCodeProviderProps {
  children: React.ReactNode;
}

export const VSCodeProvider: React.FC<VSCodeProviderProps> = ({ children }) => {
  const [vscode, setVscode] = useState<VSCodeAPI | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const vscodeApi = window.acquireVsCodeApi();
      setVscode(vscodeApi);
      setIsReady(true);
      console.log('VS Code API acquired successfully');
    } catch (error) {
      console.error('Failed to acquire VS Code API:', error);
      // In development, create a mock API
      if (process.env.NODE_ENV === 'development') {
        const mockAPI: VSCodeAPI = {
          postMessage: (message: any) => {
            console.log('Mock VS Code message:', message);
          },
          setState: (state: any) => {
            console.log('Mock setState:', state);
          },
          getState: () => {
            console.log('Mock getState called');
            return {};
          }
        };
        setVscode(mockAPI);
        setIsReady(true);
      }
    }
  }, []);

  const postMessage = useCallback((message: any) => {
    if (vscode) {
      vscode.postMessage(message);
    } else {
      console.warn('VS Code API not available, message not sent:', message);
    }
  }, [vscode]);

  const value: VSCodeContextType = {
    vscode,
    postMessage,
    isReady
  };

  return (
    <VSCodeContext.Provider value={value}>
      {children}
    </VSCodeContext.Provider>
  );
};
