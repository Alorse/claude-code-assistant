import { useEffect, useCallback } from 'react';
import { useVSCode } from '../context/VSCodeContext';

export type MessageHandler = (message: any) => void;

export const useVSCodeMessages = (handlers: Record<string, MessageHandler>) => {
  const { isReady } = useVSCode();

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = event.data;
    const handler = handlers[message.type];
    
    if (handler) {
      handler(message);
    } else {
      console.log('Unhandled message type:', message.type, message);
    }
  }, [handlers]);

  useEffect(() => {
    if (!isReady) return;

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isReady, handleMessage]);
};
