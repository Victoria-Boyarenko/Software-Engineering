// Mock LLM adapter — deterministic, no network, no API key.
// Produces a short explanation (<=2 sentences, <=200 chars) for an availability
// result. Input and output are validated; any failure yields a safe fallback
// derived from the deterministic reasonCode. The adapter never decides
// availability or modifies bookings.

import {
  clampExplanation,
  inventsBookingLabels,
  MAX_EXPLANATION_LENGTH,
  MAX_SENTENCES,
  type ExplainInput,
  type ExplainOptions,
  type ExplainOutput,
  type ExplainResult,
  type ReasonCode,
} from "./explain";
import { durationLabel, minutesToLabel } from "./time";

const FALLBACKS: Record<ReasonCode, (input: ExplainInput) => string> = {
  available: (i) =>
    `${i.roomLabel} is free from ${minutesToLabel(i.start)} to ${minutesToLabel(i.end)} (${durationLabel(i.start, i.end)}). You can book this slot now.`,
  invalid_time: () =>
    "The chosen times are not valid. Please pick a start and end in HH:MM format within the same day.",
  start_after_now: () =>
    `The start time must be later than the current time (${minutesToLabel(540)}). Pick a slot that begins after that.`,
  exceeds_max_duration: () =>
    "The requested slot is longer than the 120-minute maximum. Shorten the booking to two hours or less.",
  room_blocked: (i) =>
    `${i.roomLabel} is currently blocked and cannot be booked. Try another room or check back later.`,
  overlap: (i) =>
    `The chosen slot overlaps an existing booking in ${i.roomLabel}. Choose a time that ends before or starts after that booking.`,
  missing_times: () =>
    "Both a start and an end time are needed to check availability. Select both times and try again.",
};

function fallbackFor(input: ExplainInput): ExplainOutput {
  return { explanation: clampExplanation(FALLBACKS[input.reasonCode](input)) };
}

export function fallbackExplanation(input: ExplainInput): ExplainOutput {
  return fallbackFor(input);
}

/**
 * Validate the structured input. Returns an error string or null when valid.
 */
export function validateInput(input: unknown): string | null {
  if (input === null || typeof input !== "object") return "Input is required.";
  const i = input as Partial<ExplainInput>;
  if (typeof i.roomLabel !== "string" || i.roomLabel.trim() === "") {
    return "roomLabel must be a non-empty string.";
  }
  if (!Number.isInteger(i.start) || i.start! < 0 || i.start! > 1440) {
    return "start must be an integer minute between 0 and 1440.";
  }
  if (!Number.isInteger(i.end) || i.end! < 0 || i.end! > 1440) {
    return "end must be an integer minute between 0 and 1440.";
  }
  if (i.end! <= i.start!) {
    return "end must be greater than start.";
  }
  if (typeof i.isAvailable !== "boolean") {
    return "isAvailable must be a boolean.";
  }
  const validReasons: ReasonCode[] = [
    "available",
    "invalid_time",
    "start_after_now",
    "exceeds_max_duration",
    "room_blocked",
    "overlap",
    "missing_times",
  ];
  if (typeof i.reasonCode !== "string" || !validReasons.includes(i.reasonCode as ReasonCode)) {
    return "reasonCode must be one of the defined reason codes.";
  }
  if (i.isAvailable !== (i.reasonCode === "available")) {
    return "isAvailable must agree with reasonCode.";
  }
  if (!Array.isArray(i.knownBookingLabels) ||
    i.knownBookingLabels.some((l) => typeof l !== "string")) {
    return "knownBookingLabels must be an array of strings.";
  }
  if (i.roomLabel.length > 120) {
    return "roomLabel is too long.";
  }
  return null;
}

/**
 * Validate the adapter's output text.
 */
export function validateOutput(
  output: unknown,
  knownBookingLabels: string[],
  roomLabel = ""
): string | null {
  if (output === null || typeof output !== "object") return "Output is required.";
  const o = (output as Partial<ExplainOutput>).explanation;
  if (typeof o !== "string") return "explanation must be a string.";
  const trimmed = o.trim();
  if (trimmed.length === 0) return "explanation must not be empty.";
  if (trimmed.length > MAX_EXPLANATION_LENGTH) {
    return `explanation exceeds ${MAX_EXPLANATION_LENGTH} characters.`;
  }
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > MAX_SENTENCES) {
    return `explanation exceeds ${MAX_SENTENCES} sentences.`;
  }
  if (inventsBookingLabels(trimmed, knownBookingLabels, roomLabel)) {
    return "explanation references a booking not present in the room's fixtures.";
  }
  return null;
}

/**
 * Deterministic "generated" explanation. The phrasing is richer than the
 * fallback but still derived entirely from the deterministic result.
 */
function generate(input: ExplainInput): string {
  const time = `${minutesToLabel(input.start)}–${minutesToLabel(input.end)}`;
  switch (input.reasonCode) {
    case "available":
      return `${input.roomLabel} has no conflicting bookings between ${time}, so the slot is open for booking. The duration of ${durationLabel(input.start, input.end)} is within the allowed limit.`;
    case "invalid_time":
      return `The times you entered do not form a valid interval within the 00:00–24:00 day. Correct the start and end times to whole minutes with a later end.`;
    case "start_after_now":
      return `A booking must begin after the current time of ${minutesToLabel(540)}. Move the start to a later time and try again.`;
    case "exceeds_max_duration":
      return `This slot lasts longer than the 120-minute maximum. Reduce the duration to two hours or fewer to make it bookable.`;
    case "room_blocked":
      return `${input.roomLabel} is marked as blocked, so no booking can be placed there right now. Consider choosing a different room.`;
    case "overlap":
      return `The requested slot in ${input.roomLabel} overlaps an existing booking, so it cannot be reserved. Pick a slot that ends before or starts after that booking.`;
    case "missing_times":
      return `Both a start and an end time are required to check availability. Select both and press check again.`;
  }
}

/**
 * Mock LLM call. Simulates latency and failure modes for testing. Always
 * returns a valid ExplainResult — never throws.
 */
export async function explainAvailability(
  rawInput: unknown,
  options: ExplainOptions = {}
): Promise<ExplainResult> {
  const inputError = validateInput(rawInput);
  if (inputError) {
    const safe =
      rawInput && typeof rawInput === "object" && typeof (rawInput as ExplainInput).reasonCode === "string"
        ? fallbackFor(rawInput as ExplainInput)
        : { explanation: FALLBACKS.invalid_time({ roomLabel: "the room", start: 0, end: 1, isAvailable: false, reasonCode: "invalid_time", knownBookingLabels: [] }) };
    return { ok: false, fellBack: true, output: safe, error: inputError };
  }
  const input = rawInput as ExplainInput;

  // Simulated latency / failure.
  if (options.simulate === "timeout" || options.simulate === "api_error") {
    return {
      ok: false,
      fellBack: true,
      output: fallbackFor(input),
      error: options.simulate === "timeout" ? "simulated timeout" : "simulated API error",
    };
  }

  const draft = generate(input);
  const clamped = clampExplanation(draft);
  const out: ExplainOutput = { explanation: clamped };

  const outputError = validateOutput(out, input.knownBookingLabels, input.roomLabel);
  if (outputError) {
    return { ok: false, fellBack: true, output: fallbackFor(input), error: outputError };
  }

  return { ok: true, fellBack: false, output: out };
}
