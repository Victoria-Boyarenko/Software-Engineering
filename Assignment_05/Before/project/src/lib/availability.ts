// Smart Campus Room Availability Checker — v1
// Pure client-side availability rules. No backend, no persistence.
import { findConflict, type Booking } from "./canBook";
import { durationLabel, minutesToLabel } from "./time";
import { isStartAfterNow } from "./startTime";

export interface RoomConfig {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export type ResultKind = "available" | "unavailable" | "error";

export interface AvailabilityResult {
  kind: ResultKind;
  message: string;
  isAvailable: boolean;
}

export const CURRENT_TIME = 540; // 09:00 — fixed "now" for reproducible testing
export const MAX_DURATION = 120; // minutes — exactly 120 is allowed

export function exceedsMaxDuration(start: number, end: number): boolean {
  return end - start > MAX_DURATION;
}

// ── Core availability check (AC1–AC5) ────────────────────────────────────────
export function checkAvailability(
  start: number,
  end: number,
  room: RoomConfig,
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
  if (!isStartAfterNow(start, now)) {
    return unavailable(`The start time must be later than the current time (${minutesToLabel(now)}).`);
  }

  // AC2: max duration 120, exactly 120 allowed
  if (exceedsMaxDuration(start, end)) {
    return unavailable(
      `Booking duration is ${end - start} minutes. The maximum is ${MAX_DURATION} minutes.`
    );
  }

  // AC3: blocked room is always unavailable
  if (room.blocked) {
    return unavailable("This room is currently blocked and cannot be booked.");
  }

  // AC4: reject overlaps; touching at endpoints is allowed
  const conflict = findConflict(room.bookings, start, end);
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
