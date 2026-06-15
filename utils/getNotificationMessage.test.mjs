import { describe, it, expect } from "vitest";
import { getNotificationMessage } from "./getNotificationMessage.js";

describe("getNotificationMessage", () => {
  const HUNGER_THRESHOLD = 20;
  const JOY_THRESHOLD = 20;

  it('returns sick message when health is "sick"', () => {
    expect(
      getNotificationMessage(
        { health: "sick", hunger: 100, joy: 100 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("Koala is sick!");
  });

  it("returns starving message when both hunger and joy are 0", () => {
    expect(
      getNotificationMessage(
        { health: "normal", hunger: 0, joy: 0 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("Koala is starving!");
  });

  it("returns hungry message when hunger is below threshold (but not 0)", () => {
    expect(
      getNotificationMessage(
        { health: "normal", hunger: 10, joy: 50 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("Koala is hungry!");
  });

  it("returns lonely message when joy is below threshold", () => {
    expect(
      getNotificationMessage(
        { health: "normal", hunger: 50, joy: 10 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("Koala is lonely!");
  });

  it("returns empty string when not critical", () => {
    expect(
      getNotificationMessage(
        { health: "normal", hunger: 50, joy: 50 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("");
  });

  it("returns starving when both stats are 0 (overrides hungry)", () => {
    expect(
      getNotificationMessage(
        { health: "normal", hunger: 0, joy: 0 },
        HUNGER_THRESHOLD,
        JOY_THRESHOLD,
      ),
    ).toBe("Koala is starving!");
  });
});
