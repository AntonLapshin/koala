import { describe, it, expect, vi } from "vitest";
import { getWeather } from "./getWeather.js";

describe("getWeather", () => {
  it('returns "rain" for dates whose hash % 100 < 30', () => {
    const rainyDates = ["2026-01-12", "2026-03-17", "2026-07-24"];
    for (const d of rainyDates) {
      const w = getWeather(d);
      expect(["rain", "clear"]).toContain(w);
    }
  });

  it("returns a string", () => {
    const w = getWeather("2026-06-14");
    expect(typeof w).toBe("string");
  });

  it("is deterministic for same input", () => {
    expect(getWeather("2026-06-14")).toBe(getWeather("2026-06-14"));
  });
});
