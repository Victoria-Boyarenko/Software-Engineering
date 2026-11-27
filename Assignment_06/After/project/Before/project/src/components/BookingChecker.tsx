import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import {
  MAX_DURATION,
  checkAvailability,
  exceedsMaxDuration,
  type AvailabilityResult,
  type RoomConfig,
} from "@/lib/availability";
import { durationLabel, minutesToLabel } from "@/lib/time";
import TimeSelect from "@/components/TimeSelect";
import Timeline from "@/components/Timeline";
import ResultBanner from "@/components/ResultBanner";
import ExplainPanel from "@/components/ExplainPanel";
import type { ExplainInput } from "@/lib/explain";

interface BookingCheckerProps {
  room: RoomConfig | null;
  now: number;
}

export default function BookingChecker({ room, now }: BookingCheckerProps) {
  const [start, setStart] = useState<number | "">("");
  const [end, setEnd] = useState<number | "">("");
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  // A result belongs to the room it was checked against, so switching rooms clears it.
  const roomId = room?.id ?? null;
  const [shownRoomId, setShownRoomId] = useState(roomId);
  if (roomId !== shownRoomId) {
    setShownRoomId(roomId);
    setResult(null);
  }

  const s = start === "" ? undefined : start;
  const e = end === "" ? undefined : end;

  const livePreview = useMemo<AvailabilityResult | null>(() => {
    if (!room || s === undefined || e === undefined) return null;
    return checkAvailability(s, e, room, now);
  }, [s, e, room, now]);

  const explainInput = useMemo<ExplainInput | null>(() => {
    if (!room || s === undefined || e === undefined || !result || result.kind === "error") {
      return null;
    }
    return {
      roomLabel: room.name,
      start: s,
      end: e,
      isAvailable: result.isAvailable,
      reasonCode: result.reasonCode,
      knownBookingLabels: room.bookings.map((b) => b.label),
    };
  }, [room, s, e, result]);

  if (!room) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No room is selected. Adjust the filters to find a room to check.
      </div>
    );
  }

  const handleCheck = () => {
    if (s === undefined || e === undefined) {
      setResult({
        kind: "error",
        message: "Please select both a start and an end time.",
        isAvailable: false,
        reasonCode: "missing_times",
      });
      return;
    }
    setResult(checkAvailability(s, e, room, now));
  };

  const handleReset = () => {
    setStart("");
    setEnd("");
    setResult(null);
    setFormKey((k) => k + 1);
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
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-base font-bold text-slate-900">Check Availability</h2>
        <p className="mb-5 text-sm text-slate-500">
          Enter a time interval up to {MAX_DURATION} minutes in HH:MM format. Start must be after {minutesToLabel(now)}.
        </p>

        <div key={formKey} className="grid gap-4 sm:grid-cols-2">
          <TimeSelect label="Start time" value={start} onChange={handleStartChange} now={now} />
          <TimeSelect label="End time" value={end} onChange={handleEndChange} />
        </div>

        {duration && (
          <p className="mt-3 text-sm text-slate-600">
            Duration: <span className="font-semibold">{duration}</span>
            {s !== undefined && e !== undefined && exceedsMaxDuration(s, e) && (
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
            {explainInput && (
              <ExplainPanel input={explainInput} />
            )}
          </div>
        )}
      </div>

      <Timeline room={room} start={s} end={e} result={result} />
    </>
  );
}
