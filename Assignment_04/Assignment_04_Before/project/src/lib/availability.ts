// Smart Campus Room Availability Checker — v1
// Pure client-side availability logic. No backend, no persistence.

export interface Booking {
  label: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight
}

export interface RoomConfig {
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  bookings: Booking[];
}

export type ResultKind = "available" | "unavailable" | "error";

export interface AvailabilityResult {
  kind: ResultKind;
  message: string;
  // Convenience flags
  isAvailable: boolean;
}

// ── Fictional defaults (prototype v1) ────────────────────────────────────────
export const CURRENT_TIME = 540; // 09:00 — fixed "now" for reproducible testing
export const MAX_DURATION = 120; // minutes — exactly 120 is allowed

export const DEFAULT_ROOM: RoomConfig = {
  name: "Engineering Hall, Room 204",
  building: "Engineering Hall",
  capacity: 40,
  blocked: false,
  bookings: [
    { label: "Data Structures Lecture", start: 600, end: 660 }, // 10:00–11:00
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── Core availability check (AC1–AC5) ────────────────────────────────────────
export function checkAvailability(
  start: number,
  end: number,
  room: RoomConfig = DEFAULT_ROOM,
  now: number = CURRENT_TIME
): AvailabilityResult {
  // AC1: integer minutes, 0 <= start < end <= 1440, start > now
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return unavailable("Start and end times must be whole minutes.");
  }
  if (start < 0 || end > 1440) {
    return unavailable("Times must be between 00:00 and 24:00 (0–1440 minutes).");
  }
  if (start >= end) {
    return unavailable("The end time must be later than the start time.");
  }
  if (start <= now) {
    return unavailable(`The start time must be later than the current time (${minutesToLabel(now)}).`);
  }

  // AC2: max duration 120, exactly 120 allowed
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return unavailable(
      `Booking duration is ${duration} minutes. The maximum is ${MAX_DURATION} minutes.`
    );
  }

  // AC3: blocked room is always unavailable
  if (room.blocked) {
    return unavailable("This room is currently blocked and cannot be booked.");
  }

  // AC4: reject overlaps; touching at endpoints is allowed
  const conflict = room.bookings.find((b) => start < b.end && end > b.start);
  if (conflict) {
    return unavailable(
      `Overlaps with an existing booking: ${conflict.label} (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`
    );
  }

  // AC5: available
  return available(
    `Available! ${room.name} is free from ${minutesToLabel(start)} to ${minutesToLabel(end)} (${durationLabel(start, end)}).`
  );
}

function available(message: string): AvailabilityResult {
  return { kind: "available", message, isAvailable: true };
}

function unavailable(message: string): AvailabilityResult {
  return { kind: "unavailable", message, isAvailable: false };
}

// Build a list of selectable minute options in 15-minute increments.
export function timeOptions(now: number = CURRENT_TIME): { value: number; label: string }[] {
  const opts: { value: number; label: string }[] = [];
  for (let m = 0; m <= 1440; m += 15) {
    opts.push({ value: m, label: minutesToLabel(m) });
  }
  return opts;
}
