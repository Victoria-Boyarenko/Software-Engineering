// "Explain availability" — types, input/output contracts, and validation.
// The deterministic checker (checkAvailability) remains the sole source of truth.
// This module only rephrases its result; it never decides availability or invents bookings.

export type ReasonCode =
  | "available"
  | "invalid_time"
  | "start_after_now"
  | "exceeds_max_duration"
  | "room_blocked"
  | "overlap"
  | "missing_times";

export interface ExplainInput {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  /** Booking labels that actually exist in the selected room's fixtures. */
  knownBookingLabels: string[];
}

export interface ExplainOutput {
  explanation: string;
}

export const MAX_EXPLANATION_LENGTH = 200;
export const MAX_SENTENCES = 2;

export interface ExplainOptions {
  /** Simulated adapter behaviour for testing. */
  simulate?: "timeout" | "api_error";
}

export type ExplainResult =
  | { ok: true; output: ExplainOutput; fellBack: boolean }
  | { ok: false; fellBack: true; output: ExplainOutput; error: string };

/**
 * Map the deterministic AvailabilityResult to a reason code so the adapter
 * never re-derives availability. Determined from the confirmed message only.
 */
export function reasonCodeFromMessage(
  message: string,
  isAvailable: boolean
): ReasonCode {
  if (isAvailable) return "available";
  const m = message.toLowerCase();
  if (m.startsWith("overlaps")) return "overlap";
  if (m.includes("blocked")) return "room_blocked";
  if (m.includes("maximum")) return "exceeds_max_duration";
  if (m.includes("current time")) return "start_after_now";
  if (m.includes("whole minutes") || m.includes("between 00:00") || m.includes("later than the start")) {
    return "invalid_time";
  }
  return "invalid_time";
}

/**
 * Sentence-aware trim: collapses the text to at most MAX_SENTENCES sentences and
 * MAX_EXPLANATION_LENGTH characters, then trims trailing whitespace.
 */
export function clampExplanation(raw: string): string {
  const parts = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SENTENCES);
  let joined = parts.join(" ").trim();
  if (joined.length > MAX_EXPLANATION_LENGTH) {
    joined = joined.slice(0, MAX_EXPLANATION_LENGTH).trim();
  }
  return joined;
}

/**
 * True when the text references a booking label that is not present in the
 * selected room's fixtures. Prevents the adapter from inventing booking details.
 *
 * The room name is excluded from the check so that legitimate names containing
 * words like "Study" or "Lab" (e.g. "Library Study Pod B2") are not flagged.
 */
export function inventsBookingLabels(text: string, known: string[], roomLabel = ""): boolean {
  const lower = text.toLowerCase();
  if (known.some((label) => lower.includes(label.toLowerCase()))) return false;
  const roomless = roomLabel ? lower.replace(roomLabel.toLowerCase(), "") : lower;
  return /\b(lecture|seminar|lab|study|practical|meeting|class|session)\b/i.test(roomless);
}
