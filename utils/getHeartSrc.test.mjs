import { describe, it, expect } from "vitest";
import { getHeartSrc } from "./getHeartSrc.js";

describe("getHeartSrc", () => {
  it('returns dead heart for health "dead"', () => {
    expect(getHeartSrc({ health: "dead" })).toBe("ui/heart_dead.png");
  });

  it('returns sick heart for health "sick"', () => {
    expect(getHeartSrc({ health: "sick" })).toBe("ui/heart_sick.png");
  });

  it('returns healthy heart for health "normal"', () => {
    expect(getHeartSrc({ health: "normal" })).toBe("ui/heart_health.png");
  });

  it("returns healthy heart for any unknown health value", () => {
    expect(getHeartSrc({ health: "unknown" })).toBe("ui/heart_health.png");
  });

  it("handles empty object gracefully", () => {
    expect(getHeartSrc({})).toBe("ui/heart_health.png");
  });

  it("handles undefined argument", () => {
    expect(getHeartSrc()).toBe("ui/heart_health.png");
  });
});
