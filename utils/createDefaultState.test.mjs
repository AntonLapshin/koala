import { describe, it, expect, vi } from "vitest";
import { createDefaultState } from "./createDefaultState.js";
import { HUNGER_MAX, JOY_MAX } from "../shared/constants.js";

describe("createDefaultState", () => {
  it("returns an object with expected default values", () => {
    const state = createDefaultState();

    expect(state.hunger).toBe(HUNGER_MAX);
    expect(state.joy).toBe(JOY_MAX);
    expect(state.health).toBe("normal");
    expect(state.age).toBe(0);
    expect(state.coins).toBe(0);
    expect(state.coinsSpent).toBe(0);
    expect(state.totalLifetimeSteps).toBe(0);
    expect(state.todayStepCount).toBe(0);
    expect(state.lastStepDate).toBe("");
    expect(state.lastDecayTimestamp).toBe(0);
    expect(state.lastSaveTimestamp).toBe(0);
    expect(state.sickDayCount).toBe(0);
    expect(state.tapCounter).toBe(0);
    expect(state.zeroStatSeconds).toBe(0);
    expect(state.lastSicknessCheckDate).toBe("");
    expect(state.totalFoodBought).toBe(0);
    expect(state.totalToysBought).toBe(0);
    expect(state.totalMedicineBought).toBe(0);
  });

  it("has an eggIndex within valid range", () => {
    const state = createDefaultState();
    expect(state.eggIndex).toBeGreaterThanOrEqual(1);
    expect(state.eggIndex).toBeLessThanOrEqual(16);
    expect(Number.isInteger(state.eggIndex)).toBe(true);
  });

  it("returns a new object each call", () => {
    const a = createDefaultState();
    const b = createDefaultState();
    expect(a).not.toBe(b);
  });
});
