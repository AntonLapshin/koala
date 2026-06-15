import { describe, it, expect } from "vitest";
import { randomEggIndex } from "./randomEggIndex.js";
import { MAX_AGE } from "../shared/constants.js";

describe("randomEggIndex", () => {
  it("returns a value between 1 and MAX_AGE inclusive", () => {
    for (let i = 0; i < 100; i++) {
      const idx = randomEggIndex();
      expect(idx).toBeGreaterThanOrEqual(1);
      expect(idx).toBeLessThanOrEqual(MAX_AGE);
      expect(Number.isInteger(idx)).toBe(true);
    }
  });

  it("can produce different values", () => {
    const values = new Set();
    for (let i = 0; i < 50; i++) {
      values.add(randomEggIndex());
    }
    expect(values.size).toBeGreaterThan(1);
  });
});
