import React from "react";

interface StatusBarProps {
  text: string;
  type: "ready" | "processing" | "error";
}

const StatusBar: React.FC<StatusBarProps> = ({ text, type }) => {
  const getIndicatorColor = () => {
    switch (type) {
      case "ready":
        return "bg-green-500 shadow-green-500/50";
      case "processing":
        return "bg-orange-500 shadow-orange-500/50 animate-pulse";
      case "error":
        return "bg-red-500 shadow-red-500/50";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative flex items-center group">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full shadow-md ${getIndicatorColor()}`}
        />
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          {text}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-700 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
