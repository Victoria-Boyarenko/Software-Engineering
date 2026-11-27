// Shared HH:MM formatting and parsing. Times are minutes after midnight.

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function durationLabel(start: number, end: number): string {
  const d = end - start;
  if (d <= 0) return "0 minutes";
  if (d === 60) return "1 hour";
  if (d % 60 === 0) return `${d / 60} hours`;
  return `${d} minutes`;
}

export function parseHHMM(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return null;
  const [hStr, mStr] = trimmed.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (h < 0 || h > 24) return null;
  if (m < 0 || m > 59) return null;
  if (h === 24 && m !== 0) return null;
  return h * 60 + m;
}
