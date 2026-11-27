import { describe, it, expect } from "vitest";
import {
  clampExplanation,
  inventsBookingLabels,
  MAX_EXPLANATION_LENGTH,
} from "./explain";

describe("clampExplanation", () => {
  it("trims surrounding whitespace", () => {
    expect(clampExplanation("  Hello.  ")).toBe("Hello.");
  });

  it("limits to two sentences", () => {
    const out = clampExplanation("One. Two. Three. Four.");
    expect(out).toBe("One. Two.");
  });

  it("truncates text longer than 200 characters", () => {
    const long = "A".repeat(300) + ".";
    expect(clampExplanation(long).length).toBeLessThanOrEqual(MAX_EXPLANATION_LENGTH);
  });

  it("preserves sentence fragments separated by punctuation", () => {
    expect(clampExplanation("Hi. There. Now.")).toBe("Hi. There.");
  });
});

describe("inventsBookingLabels", () => {
  it("flags generic booking nouns when no known label is present", () => {
    expect(inventsBookingLabels("There is a lecture at noon.", [])).toBe(true);
  });

  it("does not flag when a known label is referenced", () => {
    expect(inventsBookingLabels("Overlaps Data Structures Lecture.", ["Data Structures Lecture"])).toBe(false);
  });

  it("does not flag neutral text", () => {
    expect(inventsBookingLabels("The room is free now.", [])).toBe(false);
  });

  it("does not flag room names containing 'study' when roomLabel is passed", () => {
    expect(
      inventsBookingLabels(
        "Library Study Pod B2 has no conflicting bookings.",
        ["Group Study: Thesis Review"],
        "Library Study Pod B2"
      )
    ).toBe(false);
  });

  it("does not flag room names containing 'lab' when roomLabel is passed", () => {
    expect(
      inventsBookingLabels(
        "The requested slot in Science Centre, Lab 3 overlaps an existing booking.",
        ["Chemistry Practical"],
        "Science Centre, Lab 3"
      )
    ).toBe(false);
  });

  it("still flags invented booking nouns not in the room name", () => {
    expect(
      inventsBookingLabels(
        "Engineering Hall, Room 204 has a lecture at noon.",
        [],
        "Engineering Hall, Room 204"
      )
    ).toBe(true);
  });
});


