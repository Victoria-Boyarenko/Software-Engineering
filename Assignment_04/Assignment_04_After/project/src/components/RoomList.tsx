import { Ban, SearchX, Users } from "lucide-react";
import type { RoomConfig } from "@/lib/availability";

interface RoomListProps {
  rooms: RoomConfig[];
  totalCount: number;
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
}

export default function RoomList({ rooms, totalCount, selectedRoomId, onSelect }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
      >
        <SearchX className="h-8 w-8 text-slate-400" />
        <p className="font-semibold text-slate-700">No rooms match these filters</p>
        <p className="text-sm text-slate-500">
          Lower the minimum capacity or remove an equipment filter to see more rooms.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        Showing {rooms.length} of {totalCount} rooms
      </p>
      <ul className="space-y-2">
        {rooms.map((r) => {
          const selected = r.id === selectedRoomId;
          return (
            <li key={r.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(r.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{r.name}</span>
                  <span className="block truncate text-xs text-slate-500">{r.building}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {r.capacity}
                  </span>
                  {r.blocked && (
                    <span className="flex items-center gap-1 text-rose-600">
                      <Ban className="h-3.5 w-3.5" />
                      Blocked
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
