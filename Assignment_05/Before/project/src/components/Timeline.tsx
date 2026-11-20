import { minutesToLabel } from "@/lib/time";
import type { RoomConfig, AvailabilityResult } from "@/lib/availability";

interface TimelineProps {
  room: RoomConfig;
  start?: number;
  end?: number;
  result: AvailabilityResult | null;
}

// Visual timeline from 00:00 to 24:00 showing existing bookings and the request.
export default function Timeline({ room, start, end, result }: TimelineProps) {
  const total = 1440;
  const ticks = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440];

  const requestValid = start !== undefined && end !== undefined && start < end;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Daily Timeline</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Your request
          </span>
        </div>
      </div>

      <div className="relative h-12 w-full overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
        {/* Existing bookings */}
        {room.bookings.map((b, i) => (
          <div
            key={i}
            className="absolute top-0 h-full bg-amber-400/90"
            style={{
              left: `${(b.start / total) * 100}%`,
              width: `${((b.end - b.start) / total) * 100}%`,
            }}
            title={`${b.label}: ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          />
        ))}

        {/* Requested interval */}
        {requestValid && (
          <div
            className={`absolute top-0 h-full ${
              result?.isAvailable ? "bg-blue-500/80" : "bg-rose-400/80"
            } ring-2 ring-white`}
            style={{
              left: `${(start! / total) * 100}%`,
              width: `${((end! - start!) / total) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Tick labels */}
      <div className="relative mt-1.5 h-4 text-[10px] text-slate-400">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2"
            style={{ left: `${(t / total) * 100}%` }}
          >
            {minutesToLabel(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
