import { Ban, MapPin, Sparkles, Users } from "lucide-react";
import type { RoomConfig } from "@/lib/availability";
import { minutesToLabel } from "@/lib/time";

interface RoomDetailsProps {
  room: RoomConfig;
}

export default function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Selected Room</h2>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Building</dt>
            <dd className="font-medium text-slate-800">{room.building}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Capacity</dt>
            <dd className="flex items-center gap-1.5 font-medium text-slate-800">
              <Users className="h-4 w-4" /> {room.capacity} seats
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Status</dt>
            <dd>
              {room.blocked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  <Ban className="h-3.5 w-3.5" /> Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" /> Open
                </span>
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {room.equipment.map((item) => (
            <span
              key={item}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-900">Existing Bookings</h2>
        {room.bookings.length === 0 ? (
          <p className="text-sm text-slate-500">No existing bookings today.</p>
        ) : (
          <ul className="space-y-2">
            {room.bookings.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-amber-900">{b.label}</span>
                <span className="font-mono text-amber-800">
                  {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Intervals touching at endpoints are allowed (e.g. 11:00 start is OK).
        </p>
      </div>
    </>
  );
}
