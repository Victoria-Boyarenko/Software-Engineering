import { useEffect, useState } from "react";

interface TimeSelectProps {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  now?: number;
}

function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseHHMM(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return null;
  const [hStr, mStr] = trimmed.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (h < 0 || h > 24) return null;
  if (m < 0 || m > 59) return null;
  if (h === 24 && m !== 0) return null; // 24:00 OK, 24:01 not
  return h * 60 + m;
}

// Free-text HH:MM input with 1-minute precision, plus validation messaging.
export default function TimeSelect({ label, value, onChange, now }: TimeSelectProps) {
  const [text, setText] = useState(value === "" ? "" : minutesToHHMM(value));
  const [error, setError] = useState<string | null>(null);

  // Keep local text in sync when parent resets (e.g. Reset button).
  useEffect(() => {
    setText(value === "" ? "" : minutesToHHMM(value));
    setError(null);
  }, [value]);

  const handleBlur = () => {
    if (text.trim() === "") {
      onChange("");
      setError(null);
      return;
    }
    const parsed = parseHHMM(text);
    if (parsed === null) {
      // Clear the parent's stored value so stale duration/result don't persist.
      onChange("");
      setError("Enter a time as HH:MM (00:00–24:00).");
      return;
    }
    if (now !== undefined && parsed <= now) {
      onChange("");
      setError(`Must be after ${minutesToHHMM(now)}.`);
      return;
    }
    setError(null);
    onChange(parsed);
    setText(minutesToHHMM(parsed)); // normalize display
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
