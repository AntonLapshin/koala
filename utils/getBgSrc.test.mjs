import { describe, it, expect } from "vitest";
import { getBgSrc } from "./getBgSrc.js";

describe("getBgSrc", () => {
  it('returns morning bg for "morning"', () => {
    expect(getBgSrc("morning")).toBe("bg_morning.png");
  });

  it('returns evening bg for "evening"', () => {
    expect(getBgSrc("evening")).toBe("bg_evening.png");
  });

  it('returns night bg for "night"', () => {
    expect(getBgSrc("night")).toBe("bg_night.png");
  });

  it('returns day bg for "day"', () => {
    expect(getBgSrc("day")).toBe("bg_day.png");
  });

  it('returns day bg for unknown values (default)', () => {
    expect(getBgSrc("unknown")).toBe("bg_day.png");
    expect(getBgSrc("")).toBe("bg_day.png");
  });
});
