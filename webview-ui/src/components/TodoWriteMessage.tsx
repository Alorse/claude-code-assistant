import React from "react";

interface Todo {
  content: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

interface TodoWriteMessageProps {
  data: {
    toolInfo?: string;
    toolName?: string;
    rawInput?: {
      todos: Todo[];
    };
    toolInput?: string;
  };
}

const TodoWriteMessage: React.FC<TodoWriteMessageProps> = ({ data }) => {
  const todos = data.rawInput?.todos || [];

  const getStatusIcon = (status: Todo["status"]) => {
    switch (status) {
      case "completed":
        return "☒";
      case "in_progress":
        return "☐";
      case "pending":
        return "☐";
      case "cancelled":
        return "✕";
      default:
        return "☐";
    }
  };

  const getStatusColor = (status: Todo["status"]) => {
    switch (status) {
      case "completed":
        return "text-[#98c379] line-through";
      case "in_progress":
        return "text-blue-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="tool-message px-3 py-2 bg-gray-500/5 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-2 font-bold text-xs">
          <span className="text-green-500">⏺</span>
          {`Update Todos (${todos.filter((t) => t.status === "completed").length}/${todos.length})`}
        </span>
      </div>

      {todos.length > 0 && (
        <div className="space-y-0">
          {todos.map((todo, index) => (
            <div
              key={index}
              className={`flex gap-2 px-2 items-center ${getStatusColor(todo.status)}`}
            >
              <span className="text-lg">{getStatusIcon(todo.status)}</span>
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: todo.content }}
              />
            </div>
          ))}
        </div>
      )}

      {todos.length === 0 && data.toolInput && (
        <div className="mt-2">
          <pre className="text-xs p-2 bg-editor-background rounded border border-border overflow-auto max-h-48">
            {data.toolInput}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TodoWriteMessage;
