import { describe, it, expect } from "vitest";
import { CURRENT_TIME, checkAvailability } from "@/lib/availability";
import { EQUIPMENT_OPTIONS, ROOMS } from "./rooms";
import { findConflict } from "@/lib/canBook";

describe("room fixtures", () => {
  it("provides at least four rooms", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it("gives every room a unique ID and a name and building", () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of ROOMS) {
      expect(r.id).not.toBe("");
      expect(r.name).not.toBe("");
      expect(r.building).not.toBe("");
    }
  });

  it("uses only equipment items from the shared option list", () => {
    for (const r of ROOMS) {
      for (const item of r.equipment) {
        expect(EQUIPMENT_OPTIONS).toContain(item);
      }
    }
  });

  it("keeps each room's bookings within the day and ordered", () => {
    for (const r of ROOMS) {
      for (const b of r.bookings) {
        expect(b.start).toBeGreaterThanOrEqual(0);
        expect(b.end).toBeLessThanOrEqual(1440);
        expect(b.start).toBeLessThan(b.end);
      }
    }
  });

  it("keeps each room's own bookings free of overlaps with each other", () => {
    for (const r of ROOMS) {
      r.bookings.forEach((b, i) => {
        const others = r.bookings.slice(i + 1);
        expect(findConflict(others, b.start, b.end), `${r.id} booking ${b.label}`).toBeUndefined();
      });
    }
  });

  it("includes at least one blocked room so the rule below is exercised", () => {
    expect(ROOMS.some((r) => r.blocked)).toBe(true);
  });

  it("keeps the demo fixture values unchanged", () => {
    const summary = ROOMS.map((r) => ({
      id: r.id,
      blocked: r.blocked,
      bookings: r.bookings.map((b) => [b.start, b.end]),
    }));
    expect(summary).toEqual([
      { id: "eng-204", blocked: false, bookings: [[600, 660]] },
      { id: "lib-b2", blocked: false, bookings: [[780, 840]] },
      { id: "sci-lab-3", blocked: false, bookings: [[840, 960]] },
      { id: "su-hall", blocked: false, bookings: [[1020, 1080]] },
      { id: "arts-s1", blocked: true, bookings: [] },
    ]);
  });

  it("never reports a blocked room as available, even for a free slot", () => {
    for (const r of ROOMS.filter((room) => room.blocked)) {
      const result = checkAvailability(900, 960, r, CURRENT_TIME);
      expect(result.isAvailable).toBe(false);
      expect(result.kind).toBe("unavailable");
    }
  });
});
