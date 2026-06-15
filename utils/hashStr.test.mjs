import { describe, it, expect } from "vitest";
import { hashStr } from "./hashStr.js";

describe("hashStr", () => {
  it("returns a non-negative number", () => {
    const result = hashStr("test");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("returns 0 for empty string", () => {
    expect(hashStr("")).toBe(0);
  });

  it("returns consistent results for same input", () => {
    expect(hashStr("hello")).toBe(hashStr("hello"));
  });

  it("returns different results for different inputs", () => {
    expect(hashStr("hello")).not.toBe(hashStr("world"));
  });

  it("handles long strings", () => {
    const result = hashStr("a".repeat(1000));
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
