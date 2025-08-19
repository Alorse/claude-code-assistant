import React, { useMemo, useState } from "react";

interface HistoryItem {
  filename: string;
  startTime?: string;
  messageCount?: number;
  totalCost?: number;
  firstUserMessage?: string;
  lastUserMessage?: string;
}

interface ChatHistoryModalProps {
  open: boolean;
  items: HistoryItem[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (filename: string) => void;
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

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  open,
  items,
  loading = false,
  onClose,
  onSelect,
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
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          new Date(b.startTime || 0).getTime() -
          new Date(a.startTime || 0).getTime(),
      );
    }
    return map;
  }, [filtered]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center"
      aria-modal
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative mt-16 bg-background border border-border rounded shadow-xl overflow-hidden">
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-input-background text-input-foreground px-3 py-2 rounded border border-border outline-none focus:border-focus"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-3 py-6 text-sm text-description">Loading chats...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-3 py-6 text-sm text-description">No conversations found</div>
          )}
          {groupsOrder.map((group) => {
            const arr = grouped.get(group);
            if (!arr || arr.length === 0) return null;
            return (
              <div key={group} className="mb-3">
                <div className="px-2 py-1 text-xs text-description uppercase tracking-wide">
                  {group}
                </div>
                <ul className="divide-y divide-border">
                  {arr.map((it) => {
                    // show lastUserMessage prominently
                    const last = (it.lastUserMessage || it.firstUserMessage || "conversation").slice(0, 35);
                    const label = last + ((it.lastUserMessage || it.firstUserMessage || "").length > 35 ? "…" : "");
                    const meta = `${new Date(it.startTime || 0).toLocaleString()}`;
                    return (
                      <li
                        key={it.filename}
                        className="px-3 py-2 hover:bg-gray-500/10 cursor-pointer"
                        onClick={() => onSelect(it.filename)}
                        title={it.firstUserMessage}
                      >
                        <div className="text-sm text-foreground">{label}</div>
                        <div className="text-xs text-description">{meta}</div>
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
  );
};

export default ChatHistoryModal;
