import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock,
  MapPin,
  Users,
  Ban,
  Sparkles,
} from "lucide-react";
import {
  CURRENT_TIME,
  DEFAULT_ROOM,
  MAX_DURATION,
  checkAvailability,
  durationLabel,
  minutesToLabel,
  type AvailabilityResult,
} from "@/lib/availability";
import TimeSelect from "@/components/TimeSelect";
import Timeline from "@/components/Timeline";
import ResultBanner from "@/components/ResultBanner";

export default function App() {
  const room = DEFAULT_ROOM;
  const now = CURRENT_TIME;

  const [start, setStart] = useState<number | "">("");
  const [end, setEnd] = useState<number | "">("");
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const s = start === "" ? undefined : start;
  const e = end === "" ? undefined : end;

  const livePreview = useMemo<AvailabilityResult | null>(() => {
    if (s === undefined || e === undefined) return null;
    return checkAvailability(s, e, room, now);
  }, [s, e, room, now]);

  const handleCheck = () => {
    if (s === undefined || e === undefined) {
      setResult({
        kind: "error",
        message: "Please select both a start and an end time.",
        isAvailable: false,
      });
      return;
    }
    setResult(checkAvailability(s, e, room, now));
  };

  const handleReset = () => {
    setStart("");
    setEnd("");
    setResult(null);
  };

  const handleStartChange = (v: number | "") => {
    setStart(v);
    setResult(null);
    if (v !== "" && end !== "" && v >= end) setEnd("");
  };

  const handleEndChange = (v: number | "") => {
    setEnd(v);
    setResult(null);
  };

  const duration =
    s !== undefined && e !== undefined && e > s ? durationLabel(s, e) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                Smart Campus Room Availability Checker
              </h1>
              <p className="text-xs text-slate-500">Prototype v1 · Northfield University</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:flex">
            <Clock className="h-4 w-4" />
            Current time: {minutesToLabel(now)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Room + bookings */}
          <section className="lg:col-span-2 space-y-6">
            {/* Room card */}
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
            </div>

            {/* Existing bookings */}
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
          </section>

          {/* Right: Checker */}
          <section className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-1 text-base font-bold text-slate-900">Check Availability</h2>
              <p className="mb-5 text-sm text-slate-500">
                Enter a time interval up to {MAX_DURATION} minutes in HH:MM format. Start must be after {minutesToLabel(now)}.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <TimeSelect
                  label="Start time"
                  value={start}
                  onChange={handleStartChange}
                  now={now}
                />
                <TimeSelect
                  label="End time"
                  value={end}
                  onChange={handleEndChange}
                />
              </div>

              {duration && (
                <p className="mt-3 text-sm text-slate-600">
                  Duration: <span className="font-semibold">{duration}</span>
                  {s !== undefined && e !== undefined && e - s > MAX_DURATION && (
                    <span className="ml-2 font-semibold text-rose-600">
                      (exceeds {MAX_DURATION} min max)
                    </span>
                  )}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleCheck}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Check Availability
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  Reset
                </button>
              </div>

              {/* Validation hints (live, before clicking) */}
              {livePreview && !livePreview.isAvailable && s !== undefined && e !== undefined && (
                <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Preview: {livePreview.message}
                </div>
              )}

              {/* Final result */}
              {result && (
                <div className="mt-4">
                  <ResultBanner result={result} />
                </div>
              )}
            </div>

            {/* Timeline */}
            <Timeline room={room} start={s} end={e} result={result} />
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Software Engineering assignment · Prototype v1 · Client-side logic only · No bookings are created
        </footer>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
