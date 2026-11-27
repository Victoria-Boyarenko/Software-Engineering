import { describe, it, expect } from "vitest";
import {
  explainAvailability,
  validateInput,
  validateOutput,
  fallbackExplanation,
} from "./mockLLM";
import type { ExplainInput } from "./explain";

import { ROOMS } from "@/data/rooms";
import type { RoomConfig } from "@/lib/availability";

const baseInput = (overrides: Partial<ExplainInput> = {}): ExplainInput => ({
  roomLabel: "Engineering Hall, Room 204",
  start: 660,
  end: 720,
  isAvailable: true,
  reasonCode: "available",
  knownBookingLabels: ["Data Structures Lecture"],
  ...overrides,
});

describe("validateInput", () => {
  it("accepts a well-formed input", () => {
    expect(validateInput(baseInput())).toBeNull();
  });

  it("rejects null", () => {
    expect(validateInput(null)).not.toBeNull();
  });

  it("rejects an empty roomLabel", () => {
    expect(validateInput(baseInput({ roomLabel: "  " }))).not.toBeNull();
  });

  it("rejects non-integer start", () => {
    expect(validateInput(baseInput({ start: 600.5 }))).not.toBeNull();
  });

  it("rejects end <= start", () => {
    expect(validateInput(baseInput({ start: 700, end: 700, isAvailable: true }))).not.toBeNull();
  });

  it("rejects isAvailable / reasonCode mismatch", () => {
    expect(
      validateInput(baseInput({ isAvailable: false, reasonCode: "available" }))
    ).not.toBeNull();
  });

  it("rejects an unknown reasonCode", () => {
    expect(
      validateInput(baseInput({ isAvailable: false, reasonCode: "bogus" as never }))
    ).not.toBeNull();
  });

  it("rejects an overly long roomLabel (over 120 chars)", () => {
    expect(
      validateInput(baseInput({ roomLabel: "X".repeat(121) }))
    ).not.toBeNull();
  });

  it("accepts a roomLabel of exactly 120 chars", () => {
    expect(validateInput(baseInput({ roomLabel: "X".repeat(120) }))).toBeNull();
  });
});

describe("validateOutput", () => {
  it("accepts a short two-sentence explanation", () => {
    expect(validateOutput({ explanation: "Room is free. Book it now." }, [])).toBeNull();
  });

  it("rejects empty explanations", () => {
    expect(validateOutput({ explanation: "   " }, [])).not.toBeNull();
  });

  it("rejects explanations over 200 chars", () => {
    expect(validateOutput({ explanation: "A".repeat(201) + "." }, [])).not.toBeNull();
  });

  it("rejects more than two sentences", () => {
    expect(validateOutput({ explanation: "One. Two. Three." }, [])).not.toBeNull();
  });

  it("rejects invented booking nouns", () => {
    expect(validateOutput({ explanation: "A lecture blocks the room." }, [])).not.toBeNull();
  });
});

describe("explainAvailability", () => {
  it("returns a valid explanation for an available slot", async () => {
    const res = await explainAvailability(baseInput());
    expect(res.ok).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
    expect(res.output.explanation.length).toBeLessThanOrEqual(200);
  });

  it("explains an overlap without inventing bookings", async () => {
    const res = await explainAvailability(
      baseInput({
        start: 630,
        end: 690,
        isAvailable: false,
        reasonCode: "overlap",
      })
    );
    expect(res.ok).toBe(true);
    expect(res.output.explanation).not.toContain("Data Structures Lecture");
  });

  it("generates a non-fallback explanation for all five rooms (F1 regression)", async () => {
    // Find a free slot for each room (start after all bookings + current time).
    function freeSlot(room: RoomConfig): { start: number; end: number } {
      const afterBookings = room.bookings.length
        ? Math.max(...room.bookings.map((b) => b.end))
        : 540;
      const start = Math.max(afterBookings, 540) + 60;
      return { start, end: start + 60 };
    }
    for (const room of ROOMS) {
      if (room.blocked) continue;
      const { start, end } = freeSlot(room);
      const res = await explainAvailability({
        roomLabel: room.name,
        start,
        end,
        isAvailable: true,
        reasonCode: "available",
        knownBookingLabels: room.bookings.map((b) => b.label),
      });
      expect(res.ok).toBe(true);
      expect(res.fellBack).toBe(false);
      expect(res.output.explanation).toContain(room.name);
      expect(res.output.explanation.length).toBeLessThanOrEqual(200);
    }
  });

  it("does not flag 'Library Study Pod B2' as inventing bookings (F1 regression)", async () => {
    const res = await explainAvailability({
      roomLabel: "Library Study Pod B2",
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: "available",
      knownBookingLabels: ["Group Study: Thesis Review"],
    });
    expect(res.ok).toBe(true);
    expect(res.fellBack).toBe(false);
    expect(res.output.explanation).toContain("Library Study Pod B2");
  });

  it("does not flag 'Science Centre, Lab 3' as inventing bookings (F1 regression)", async () => {
    const res = await explainAvailability({
      roomLabel: "Science Centre, Lab 3",
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: "available",
      knownBookingLabels: ["Chemistry Practical"],
    });
    expect(res.ok).toBe(true);
    expect(res.fellBack).toBe(false);
    expect(res.output.explanation).toContain("Science Centre, Lab 3");
  });

  it("explains a blocked room", async () => {
    const res = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "room_blocked" })
    );
    expect(res.ok).toBe(true);
    expect(res.output.explanation).toContain("blocked");
  });

  it("explains an invalid time", async () => {
    const res = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "invalid_time" })
    );
    expect(res.ok).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
  });

  it("explains a past-time start", async () => {
    const res = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "start_after_now" })
    );
    expect(res.ok).toBe(true);
  });

  it("explains an excessive duration", async () => {
    const res = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "exceeds_max_duration" })
    );
    expect(res.ok).toBe(true);
    expect(res.output.explanation).toContain("120");
  });

  it("falls back deterministically on simulated timeout", async () => {
    const res = await explainAvailability(baseInput(), { simulate: "timeout" });
    expect(res.ok).toBe(false);
    expect(res.fellBack).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
  });

  it("falls back deterministically on simulated API error", async () => {
    const res = await explainAvailability(baseInput(), { simulate: "api_error" });
    expect(res.ok).toBe(false);
    expect(res.fellBack).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
  });

  it("falls back on malformed input without throwing", async () => {
    const res = await explainAvailability(null);
    expect(res.ok).toBe(false);
    expect(res.fellBack).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
  });

  it("falls back on empty input", async () => {
    const res = await explainAvailability({});
    expect(res.ok).toBe(false);
    expect(res.fellBack).toBe(true);
  });

  it("falls back on overly long input (roomLabel over 120 chars)", async () => {
    const res = await explainAvailability(
      baseInput({ roomLabel: "X".repeat(200) })
    );
    expect(res.ok).toBe(false);
    expect(res.fellBack).toBe(true);
    expect(res.output.explanation.length).toBeGreaterThan(0);
    expect(res.output.explanation.length).toBeLessThanOrEqual(200);
  });

  it("never changes the deterministic availability decision during failures", async () => {
    // The adapter output only carries explanation text; isAvailable is never
    // present in ExplainOutput, so the decision cannot be overridden.
    const scenarios: Array<{ input: Partial<ExplainInput>; simulate?: "timeout" | "api_error" }> = [
      { input: { isAvailable: false, reasonCode: "overlap" } },
      { input: { isAvailable: false, reasonCode: "room_blocked" } },
      { input: { isAvailable: false, reasonCode: "invalid_time" } },
      { input: { isAvailable: false, reasonCode: "start_after_now" } },
      { input: { isAvailable: false, reasonCode: "exceeds_max_duration" } },
      { input: {}, simulate: "timeout" },
      { input: {}, simulate: "api_error" },
    ];
    for (const { input, simulate } of scenarios) {
      const res = await explainAvailability(
        baseInput({ isAvailable: input.isAvailable ?? true, reasonCode: input.reasonCode ?? "available", ...input }),
        simulate ? { simulate } : undefined
      );
      // ExplainOutput contains only { explanation: string } — no isAvailable field.
      expect("isAvailable" in res.output).toBe(false);
      expect(typeof res.output.explanation).toBe("string");
      expect(res.output.explanation.length).toBeGreaterThan(0);
    }
  });

  it("never exceeds two sentences or 200 characters", async () => {
    const codes = [
      "available",
      "invalid_time",
      "start_after_now",
      "exceeds_max_duration",
      "room_blocked",
      "overlap",
    ] as const;
    for (const reasonCode of codes) {
      const res = await explainAvailability(
        baseInput({ isAvailable: reasonCode === "available", reasonCode })
      );
      const sentences = res.output.explanation.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeLessThanOrEqual(2);
      expect(res.output.explanation.length).toBeLessThanOrEqual(200);
    }
  });
});

describe("fallbackExplanation", () => {
  it("returns a non-empty explanation for available", () => {
    expect(fallbackExplanation(baseInput()).explanation.length).toBeGreaterThan(0);
  });
});
