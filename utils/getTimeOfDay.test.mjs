import { describe, it, expect } from "vitest";
import { getTimeOfDay } from "./getTimeOfDay.js";

describe("getTimeOfDay", () => {
  it('returns "morning" for 6-11', () => {
    expect(getTimeOfDay(6)).toBe("morning");
    expect(getTimeOfDay(8)).toBe("morning");
    expect(getTimeOfDay(11)).toBe("morning");
  });

  it('returns "day" for 12-17', () => {
    expect(getTimeOfDay(12)).toBe("day");
    expect(getTimeOfDay(15)).toBe("day");
    expect(getTimeOfDay(17)).toBe("day");
  });

  it('returns "evening" for 18-21', () => {
    expect(getTimeOfDay(18)).toBe("evening");
    expect(getTimeOfDay(20)).toBe("evening");
    expect(getTimeOfDay(21)).toBe("evening");
  });

  it('returns "night" for 22-23 and 0-5', () => {
    expect(getTimeOfDay(0)).toBe("night");
    expect(getTimeOfDay(3)).toBe("night");
    expect(getTimeOfDay(5)).toBe("night");
    expect(getTimeOfDay(22)).toBe("night");
    expect(getTimeOfDay(23)).toBe("night");
  });
});
