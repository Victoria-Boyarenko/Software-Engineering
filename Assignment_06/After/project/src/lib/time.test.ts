import { describe, it, expect } from "vitest";
import { durationLabel, minutesToLabel, parseHHMM } from "./time";

describe("minutesToLabel", () => {
  it("formats minutes after midnight as HH:MM", () => {
    expect(minutesToLabel(0)).toBe("00:00");
    expect(minutesToLabel(605)).toBe("10:05");
    expect(minutesToLabel(1440)).toBe("24:00");
  });

  it("throws a RangeError for negative values", () => {
    expect(() => minutesToLabel(-30)).toThrow(RangeError);
  });

  it("throws a RangeError for values above 1440", () => {
    expect(() => minutesToLabel(1500)).toThrow(RangeError);
  });

  it("throws a RangeError for non-finite values", () => {
    expect(() => minutesToLabel(NaN)).toThrow(RangeError);
    expect(() => minutesToLabel(Infinity)).toThrow(RangeError);
  });
});

describe("durationLabel", () => {
  it("uses singular and plural hour and minute wording", () => {
    expect(durationLabel(600, 630)).toBe("30 minutes");
    expect(durationLabel(600, 660)).toBe("1 hour");
    expect(durationLabel(600, 720)).toBe("2 hours");
    expect(durationLabel(600, 690)).toBe("90 minutes");
  });
});

describe("parseHHMM", () => {
  it("parses valid times, including single-digit hours and surrounding spaces", () => {
    expect(parseHHMM("9:05")).toBe(545);
    expect(parseHHMM(" 14:01 ")).toBe(841);
    expect(parseHHMM("24:00")).toBe(1440);
  });

  it("rejects malformed text and out-of-range values", () => {
    expect(parseHHMM("abc")).toBeNull();
    expect(parseHHMM("1400")).toBeNull();
    expect(parseHHMM("12:60")).toBeNull();
    expect(parseHHMM("24:01")).toBeNull();
    expect(parseHHMM("25:00")).toBeNull();
  });
});
