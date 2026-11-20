import { describe, it, expect } from "vitest";
import { isStartAfterNow } from "./startTime";

describe("isStartAfterNow — AC1 start must be after now", () => {
  it("accepts a start one minute after now", () => {
    expect(isStartAfterNow(541, 540)).toBe(true);
  });

  it("rejects a start equal to now", () => {
    expect(isStartAfterNow(540, 540)).toBe(false);
  });

  it("rejects a start before now", () => {
    expect(isStartAfterNow(539, 540)).toBe(false);
  });
});
