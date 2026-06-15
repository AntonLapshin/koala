import { describe, it, expect } from "vitest";
import {
  calculateCoinsEarned,
  calculateRemainingCoins,
} from "./calculateCoins.js";

describe("calculateCoinsEarned", () => {
  const STEPS_PER_COIN = 100;

  it("returns 0 for 0 steps", () => {
    expect(calculateCoinsEarned(0, STEPS_PER_COIN)).toBe(0);
  });

  it("returns 0 for steps below threshold", () => {
    expect(calculateCoinsEarned(50, STEPS_PER_COIN)).toBe(0);
  });

  it("returns 1 for exactly STEPS_PER_COIN", () => {
    expect(calculateCoinsEarned(100, STEPS_PER_COIN)).toBe(1);
  });

  it("returns correct coins for multiple of threshold", () => {
    expect(calculateCoinsEarned(500, STEPS_PER_COIN)).toBe(5);
  });

  it("floors partial coins", () => {
    expect(calculateCoinsEarned(250, STEPS_PER_COIN)).toBe(2);
  });
});

describe("calculateRemainingCoins", () => {
  const STEPS_PER_COIN = 100;

  it("returns 0 when coinsSpent equals earned", () => {
    expect(calculateRemainingCoins(300, 3, STEPS_PER_COIN)).toBe(0);
  });

  it("returns remaining when coinsSpent is less than earned", () => {
    expect(calculateRemainingCoins(500, 2, STEPS_PER_COIN)).toBe(3);
  });

  it("returns 0 when coinsSpent exceeds earned", () => {
    expect(calculateRemainingCoins(100, 5, STEPS_PER_COIN)).toBe(0);
  });

  it("returns total earned when nothing spent", () => {
    expect(calculateRemainingCoins(700, 0, STEPS_PER_COIN)).toBe(7);
  });
});
