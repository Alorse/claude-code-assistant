import React, { useState, useMemo } from "react";
import FloatingMenu from "./FloatingMenu";

interface HistoryItem {
  filename: string;
  startTime?: string;
  messageCount?: number;
  totalCost?: number;
  firstUserMessage?: string;
  lastUserMessage?: string;
}

interface ChatHistoryFloatingMenuProps {
  open: boolean;
  items: HistoryItem[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (filename: string) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

function formatDateGroup(
  dateStr?: string,
): "Today" | "Yesterday" | "Last Week" | "Last Month" | "Older" {
  if (!dateStr) return "Older";
  const d = new Date(dateStr);
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(
    (((now.setHours(0, 0, 0, 0) as unknown as number) -
      d.setHours(0, 0, 0, 0)) as unknown as number) / msInDay,
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Last Week";
  if (diffDays <= 31) return "Last Month";
  return "Older";
}

const groupsOrder = [
  "Today",
  "Yesterday",
  "Last Week",
  "Last Month",
  "Older",
] as const;

const ChatHistoryFloatingMenu: React.FC<ChatHistoryFloatingMenuProps> = ({
  open,
  items,
  loading = false,
  onClose,
  onSelect,
  triggerRef,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        (it.firstUserMessage || "").toLowerCase().includes(q) ||
        (it.lastUserMessage || "").toLowerCase().includes(q) ||
        (it.filename || "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    for (const it of filtered) {
      const g = formatDateGroup(it.startTime);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    // sort each group by startTime desc
    for (const [, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          new Date(b.startTime || 0).getTime() -
          new Date(a.startTime || 0).getTime(),
      );
    }
    return map;
  }, [filtered]);

  // Convert history items to floating menu options
  const options = useMemo(() => {
    const result: Array<{
      value: string;
      label: string;
      description?: string;
      isGroup?: boolean;
      isSearch?: boolean;
    }> = [];

    // Add search input as first option
    result.push({
      value: "search",
      label: "Search conversations...",
      description: "Type to search",
      isSearch: true,
    });

    // Add grouped history items
    groupsOrder.forEach((group) => {
      const arr = grouped.get(group);
      if (!arr || arr.length === 0) return;

      // Add group header
      result.push({
        value: `group-${group}`,
        label: group,
        description: `${arr.length} conversation${arr.length > 1 ? 's' : ''}`,
        isGroup: true,
      });

      // Add conversations in this group
      arr.forEach((item) => {
        const last = (
          item.lastUserMessage ||
          item.firstUserMessage ||
          "conversation"
        ).slice(0, 35);
        const label =
          last +
          ((item.lastUserMessage || item.firstUserMessage || "").length > 35
            ? "…"
            : "");
        const meta = `${new Date(item.startTime || 0).toLocaleString()}`;
        
        result.push({
          value: item.filename,
          label: label,
          description: meta,
        });
      });
    });

    return result;
  }, [grouped]);

  const handleSelect = (value: string) => {
    if (value === "search" || value.startsWith("group-")) {
      return; // Do nothing for search and group headers
    }
    onSelect(value);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]" aria-modal>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Floating Menu */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="bg-background border border-border rounded shadow-xl overflow-hidden w-80 max-h-96">
          {/* Search Input */}
          <div className="p-3 border-b border-border">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-input-background text-input-foreground px-2 py-1.5 text-sm rounded border border-border outline-none focus:border-focus"
              autoFocus
            />
          </div>

          {/* History List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-3 py-6 text-sm text-description text-center">
                Loading chats...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="px-3 py-6 text-sm text-description text-center">
                No conversations found
              </div>
            )}
            {!loading && filtered.length > 0 && groupsOrder.map((group) => {
              const arr = grouped.get(group);
              if (!arr || arr.length === 0) return null;
              return (
                <div key={group} className="mb-3">
                  <div className="px-3 py-1 text-xs text-description uppercase tracking-wide bg-muted/30">
                    {group}
                  </div>
                  <ul className="divide-y divide-border">
                    {arr.map((item) => {
                      const last = (
                        item.lastUserMessage ||
                        item.firstUserMessage ||
                        "conversation"
                      ).slice(0, 35);
                      const label =
                        last +
                        ((item.lastUserMessage || item.firstUserMessage || "").length > 35
                          ? "…"
                          : "");
                      const meta = `${new Date(item.startTime || 0).toLocaleString()}`;
                      return (
                        <li
                          key={item.filename}
                          className="px-3 py-2 hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-colors"
                          onClick={() => {
                            onSelect(item.filename);
                            onClose();
                          }}
                          title={item.firstUserMessage}
                        >
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{meta}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryFloatingMenu;
