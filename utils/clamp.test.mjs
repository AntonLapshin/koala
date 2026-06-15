import { describe, it, expect } from "vitest";
import { clamp } from "./clamp.js";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns min when value equals min", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-7, -10, -5)).toBe(-7);
  });

  it("handles min equal to max", () => {
    expect(clamp(3, 5, 5)).toBe(5);
  });

  it("handles floating point values", () => {
    expect(clamp(3.5, 0, 10)).toBe(3.5);
  });
});
