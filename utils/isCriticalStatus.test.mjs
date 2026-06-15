import { describe, it, expect } from "vitest";
import { isCriticalStatus } from "./isCriticalStatus.js";

describe("isCriticalStatus", () => {
  const HUNGER_THRESHOLD = 20;
  const JOY_THRESHOLD = 20;

  it("returns true when health is sick", () => {
    expect(
      isCriticalStatus(
        { health: "sick", hunger: 100, joy: 100 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe(true);
  });

  it("returns true when hunger is below threshold", () => {
    expect(
      isCriticalStatus(
        { health: "normal", hunger: 10, joy: 100 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe(true);
  });

  it("returns true when joy is below threshold", () => {
    expect(
      isCriticalStatus(
        { health: "normal", hunger: 100, joy: 10 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe(true);
  });

  it("returns false when all stats are normal", () => {
    expect(
      isCriticalStatus(
        { health: "normal", hunger: 50, joy: 50 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe(false);
  });

  it("returns true when all conditions are critical", () => {
    expect(
      isCriticalStatus(
        { health: "sick", hunger: 0, joy: 0 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe(true);
  });
});
