import { useEffect, useRef, useState } from "react";
import { minutesToLabel, parseHHMM } from "@/lib/time";
import { isStartAfterNow } from "@/lib/startTime";

interface TimeSelectProps {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  now?: number;
}

// Free-text HH:MM input with 1-minute precision, plus validation messaging.
export default function TimeSelect({ label, value, onChange, now }: TimeSelectProps) {
  const [text, setText] = useState(value === "" ? "" : minutesToLabel(value));
  const [error, setError] = useState<string | null>(null);
  const rejectedHere = useRef(false);

  // Keep local text in sync when parent resets (e.g. Reset button).
  useEffect(() => {
    if (rejectedHere.current) {
      rejectedHere.current = false;
      return;
    }
    setText(value === "" ? "" : minutesToLabel(value));
    setError(null);
  }, [value]);

  // Clears the parent's stored value so stale duration/result don't persist.
  // The flag stops the sync effect from wiping the error this rejection sets.
  const reject = (message: string) => {
    if (value !== "") rejectedHere.current = true;
    onChange("");
    setError(message);
  };

  const handleBlur = () => {
    if (text.trim() === "") {
      onChange("");
      setError(null);
      return;
    }
    const parsed = parseHHMM(text);
    if (parsed === null) {
      reject("Enter a time as HH:MM (00:00–24:00).");
      return;
    }
    if (now !== undefined && !isStartAfterNow(parsed, now)) {
      reject(`Must be after ${minutesToLabel(now)}.`);
      return;
    }
    setError(null);
    onChange(parsed);
    setText(minutesToLabel(parsed)); // normalize display
  };

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 font-mono text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : (
        <span className="text-xs text-slate-400">Format HH:MM, e.g. 14:01</span>
      )}
    </label>
  );
}
