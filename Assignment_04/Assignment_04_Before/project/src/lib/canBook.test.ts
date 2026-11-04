import { describe, it, expect } from "vitest";
import { canBook, type Booking } from "./canBook";

// Fixture: a room with one existing booking 10:00-11:00 (600-660)
const existing: Booking[] = [
  { label: "Data Structures Lecture", start: 600, end: 660 },
];

// ── T01-T05: no-overlap cases (available) ──────────────────────────────────
describe("canBook — no overlap (returns true)", () => {
  // T01: fully before the existing booking
  it("T01: interval fully before existing booking", () => {
    expect(canBook(existing, 540, 600)).toBe(true);
  });

  // T02: ends exactly when existing starts (touching at endpoint)
  it("T02: interval ends exactly at existing start (touching)", () => {
    expect(canBook(existing, 540, 600)).toBe(true);
  });

  // T03: starts exactly when existing ends (touching at endpoint)
  it("T03: interval starts exactly at existing end (touching)", () => {
    expect(canBook(existing, 660, 720)).toBe(true);
  });

  // T04: fully after the existing booking
  it("T04: interval fully after existing booking", () => {
    expect(canBook(existing, 700, 760)).toBe(true);
  });

  // T05: empty existing bookings list
  it("T05: no existing bookings", () => {
    expect(canBook([], 540, 600)).toBe(true);
  });

  // T06: interval fully within a gap between two bookings (touching both)
  it("T06: fits exactly in a gap between two bookings (touching both)", () => {
    const two: Booking[] = [
      { label: "A", start: 540, end: 600 },
      { label: "B", start: 660, end: 720 },
    ];
    expect(canBook(two, 600, 660)).toBe(true);
  });
});

// ── T07-T14: overlap cases (returns false) ──────────────────────────────────
describe("canBook — overlap (returns false)", () => {
  // T07: proposed interval fully contains existing
  it("T07: proposed interval fully contains existing booking", () => {
    expect(canBook(existing, 540, 720)).toBe(false);
  });

  // T08: existing fully contains proposed
  it("T08: existing booking fully contains proposed interval", () => {
    expect(canBook(existing, 610, 650)).toBe(false);
  });

  // T09: partial overlap on the left side
  it("T09: partial overlap on left side", () => {
    expect(canBook(existing, 540, 650)).toBe(false);
  });

  // T10: partial overlap on the right side
  it("T10: partial overlap on right side", () => {
    expect(canBook(existing, 650, 720)).toBe(false);
  });

  // T11: proposed starts before, ends during existing
  it("T11: proposed starts before, ends inside existing", () => {
    expect(canBook(existing, 570, 620)).toBe(false);
  });

  // T12: proposed starts inside existing, ends after
  it("T12: proposed starts inside existing, ends after", () => {
    expect(canBook(existing, 620, 700)).toBe(false);
  });

  // T13: proposed equals existing exactly
  it("T13: proposed interval equals existing booking", () => {
    expect(canBook(existing, 600, 660)).toBe(false);
  });

  // T14: overlap with second of two bookings
  it("T14: overlap with the second of two bookings", () => {
    const two: Booking[] = [
      { label: "A", start: 540, end: 600 },
      { label: "B", start: 660, end: 720 },
    ];
    expect(canBook(two, 700, 760)).toBe(false);
  });
});

// ── T15-T18: touching-endpoint boundary cases (returns true) ────────────────
describe("canBook — touching endpoints are NOT overlaps", () => {
  // T15: zero-gap with a single booking on the start side
  it("T15: ends exactly at existing start", () => {
    expect(canBook(existing, 540, 600)).toBe(true);
  });

  // T16: zero-gap with a single booking on the end side
  it("T16: starts exactly at existing end", () => {
    expect(canBook(existing, 660, 720)).toBe(true);
  });

  // T17: chain of touching bookings, no overlap
  it("T17: three touching bookings in a row, no overlap", () => {
    const chain: Booking[] = [
      { label: "A", start: 540, end: 600 },
      { label: "B", start: 600, end: 660 },
      { label: "C", start: 660, end: 720 },
    ];
    expect(canBook(chain, 720, 780)).toBe(true);
  });

  // T18: touches existing on both sides in a two-booking list
  it("T18: touches two bookings at opposite endpoints", () => {
    const two: Booking[] = [
      { label: "A", start: 540, end: 600 },
      { label: "B", start: 660, end: 720 },
    ];
    expect(canBook(two, 600, 660)).toBe(true);
  });
});

// ── T19-T22: multiple bookings mixed ───────────────────────────────────────
describe("canBook — multiple bookings", () => {
  const multi: Booking[] = [
    { label: "A", start: 540, end: 600 }, // 09:00-10:00
    { label: "B", start: 660, end: 720 }, // 11:00-12:00
    { label: "C", start: 780, end: 840 }, // 13:00-14:00
  ];

  // T19: fits in first gap (touching)
  it("T19: fits in first gap between A and B", () => {
    expect(canBook(multi, 600, 660)).toBe(true);
  });

  // T20: fits in second gap (touching)
  it("T20: fits in second gap between B and C", () => {
    expect(canBook(multi, 720, 780)).toBe(true);
  });

  // T21: overlaps booking B
  it("T21: overlaps booking B", () => {
    expect(canBook(multi, 700, 730)).toBe(false);
  });

  // T22: overlaps booking C partially
  it("T22: overlaps booking C on the left edge", () => {
    expect(canBook(multi, 760, 790)).toBe(false);
  });
});

// ── T23-T26: input immutability / purity ────────────────────────────────────
describe("canBook — does not mutate the input array", () => {
  // T23: existing array reference unchanged
  it("T23: does not change the length of the existing array", () => {
    const copy = [...existing];
    canBook(existing, 540, 600);
    expect(existing.length).toBe(copy.length);
  });

  // T24: existing array element contents unchanged
  it("T24: does not modify booking objects in the array", () => {
    const snapshot = existing.map((b) => ({ ...b }));
    canBook(existing, 540, 720);
    expect(existing).toEqual(snapshot);
  });

  // T25: same array reference returned (no reassignment of input)
  it("T25: the existing array reference remains the same", () => {
    const ref = existing;
    canBook(existing, 610, 650);
    expect(existing).toBe(ref);
  });

  // T26: repeated calls keep the array stable
  it("T26: repeated calls do not alter the existing array", () => {
    const snapshot = JSON.stringify(existing);
    for (let i = 0; i < 5; i++) {
      canBook(existing, 500 + i, 800 + i);
    }
    expect(JSON.stringify(existing)).toBe(snapshot);
  });
});
