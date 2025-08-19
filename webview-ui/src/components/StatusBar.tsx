import React from 'react';

interface StatusBarProps {
  text: string;
  type: 'ready' | 'processing' | 'error';
}

const StatusBar: React.FC<StatusBarProps> = ({ text, type }) => {
  const getIndicatorColor = () => {
    switch (type) {
      case 'ready':
        return 'bg-green-500 shadow-green-500/50';
      case 'processing':
        return 'bg-orange-500 shadow-orange-500/50 animate-pulse';
      case 'error':
        return 'bg-red-500 shadow-red-500/50';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-border text-sm font-medium text-gray-200">
      <div className={`w-2 h-2 rounded-full shadow-md ${getIndicatorColor()}`} />
      <span className="flex-1">{text}</span>
    </div>
  );
};

export default StatusBar;
