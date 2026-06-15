import { describe, it, expect } from "vitest";
import { createGameEngine } from "./gameEngine.js";
import {
  HUNGER_MAX,
  JOY_MAX,
  HUNGER_DECAY_PER_HOUR,
  HUNGER_DECAY_PER_HOUR_SICK,
  JOY_DECAY_PER_HOUR,
  JOY_DECAY_PER_HOUR_SICK,
  STORE_FOOD_COST,
  STORE_TOY_COST,
  STORE_MEDICINE_COST,
  STORE_FOOD_HUNGER,
  STORE_TOY_JOY,
  STEPS_PER_COIN,
  PET_TAPS_FOR_BONUS,
  PET_HUNGER_BONUS,
  PET_JOY_BONUS,
  SICK_PET_TAPS_TO_CURE,
  DEATH_ZERO_STAT_SECONDS,
} from "./constants.js";

function createMockStorage(initial = null) {
  let data = initial ? JSON.parse(JSON.stringify(initial)) : null;
  return {
    load: () => data,
    save: (state) => {
      data = JSON.parse(JSON.stringify(state));
    },
  };
}

const BASE_TIME = new Date("2026-06-14T12:00:00Z").getTime();
const SECOND = 1000;
const HOUR = 60 * 60 * 1000;

function makeSaved(overrides = {}) {
  const ts =
    overrides.lastSaveTimestamp !== undefined
      ? overrides.lastSaveTimestamp
      : BASE_TIME;
  return {
    hunger: HUNGER_MAX,
    joy: JOY_MAX,
    health: "normal",
    age: 0,
    eggIndex: 7,
    coins: 0,
    coinsSpent: 0,
    totalLifetimeSteps: 0,
    todayStepCount: 0,
    lastStepDate: "2026-06-14",
    lastDecayTimestamp:
      overrides.lastDecayTimestamp !== undefined
        ? overrides.lastDecayTimestamp
        : ts,
    lastSaveTimestamp: ts,
    sickDayCount: 0,
    tapCounter: 0,
    zeroStatSeconds: 0,
    lastSicknessCheckDate: "2026-06-14",
    ...overrides,
  };
}

function createAdapter(overrides = {}) {
  let currentTime = BASE_TIME;
  let currentSteps = 0;
  return {
    storage: createMockStorage(overrides.savedState),
    getTime: () => currentTime,
    getSteps: () => currentSteps,
    setTime: (ms) => {
      currentTime = ms;
    },
    addSteps: (n) => {
      currentSteps += n;
    },
  };
}

function makeEngine(adapter) {
  const engine = createGameEngine(adapter);
  engine.init();
  return engine;
}

describe("gameEngine", () => {
  describe("initialization", () => {
    it("creates default state when no saved state exists", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.hunger).toBe(HUNGER_MAX);
      expect(state.joy).toBe(JOY_MAX);
      expect(state.health).toBe("normal");
      expect(state.age).toBe(0);
      expect(state.coins).toBe(0);
    });

    it("restores saved state on init", () => {
      const saved = makeSaved({
        hunger: 50,
        joy: 60,
        age: 3,
        coins: 5,
        coinsSpent: 0,
        totalLifetimeSteps: 5 * STEPS_PER_COIN,
        todayStepCount: 0,
        lastSaveTimestamp: BASE_TIME - 2 * SECOND,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.age).toBe(3);
      expect(state.coins).toBe(5);
    });

    it("applies time decay when restoring saved state", () => {
      const saved = makeSaved({
        lastSaveTimestamp: BASE_TIME - 1 * HOUR,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.hunger).toBe(HUNGER_MAX - 1 * HUNGER_DECAY_PER_HOUR);
      expect(state.joy).toBe(JOY_MAX - 1 * JOY_DECAY_PER_HOUR);
    });
  });

  describe("petting", () => {
    it("increments tap counter", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      engine.pet();
      expect(engine.getState().tapCounter).toBe(1);
    });

    it("10 taps grant +1 hunger and +1 joy", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      for (let i = 0; i < PET_TAPS_FOR_BONUS; i++) {
        engine.pet();
      }
      const state = engine.getState();
      expect(state.hunger).toBe(HUNGER_MAX);
      expect(state.joy).toBe(JOY_MAX);
      expect(state.tapCounter).toBe(0);
    });

    it("10 taps increase stats when below max", () => {
      const saved = makeSaved({ hunger: 50, joy: 50 });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      for (let i = 0; i < PET_TAPS_FOR_BONUS; i++) {
        engine.pet();
      }
      const state = engine.getState();
      expect(state.hunger).toBe(50 + PET_HUNGER_BONUS);
      expect(state.joy).toBe(50 + PET_JOY_BONUS);
    });

    it("100 taps cure sickness", () => {
      const saved = makeSaved({ hunger: 50, joy: 50, health: "sick" });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      for (let i = 0; i < SICK_PET_TAPS_TO_CURE; i++) {
        engine.pet();
      }
      const state = engine.getState();
      expect(state.health).toBe("normal");
    });
  });

  describe("store", () => {
    it("food deducts coins and adds hunger", () => {
      const saved = makeSaved({
        hunger: 40,
        coins: STORE_FOOD_COST,
        coinsSpent: 0,
        totalLifetimeSteps: STORE_FOOD_COST * STEPS_PER_COIN,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const result = engine.buy("food");
      const state = engine.getState();
      expect(result).toBe(true);
      expect(state.coins).toBe(0);
      expect(state.hunger).toBe(40 + STORE_FOOD_HUNGER);
    });

    it("toy deducts coins and adds joy", () => {
      const saved = makeSaved({
        joy: 40,
        coins: STORE_TOY_COST,
        coinsSpent: 0,
        totalLifetimeSteps: STORE_TOY_COST * STEPS_PER_COIN,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const result = engine.buy("toy");
      const state = engine.getState();
      expect(result).toBe(true);
      expect(state.coins).toBe(0);
      expect(state.joy).toBe(40 + STORE_TOY_JOY);
    });

    it("medicine deducts coins and cures sickness", () => {
      const saved = makeSaved({
        hunger: 50,
        joy: 50,
        health: "sick",
        coins: STORE_MEDICINE_COST,
        coinsSpent: 0,
        totalLifetimeSteps: STORE_MEDICINE_COST * STEPS_PER_COIN,
        sickDayCount: 5,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const result = engine.buy("medicine");
      const state = engine.getState();
      expect(result).toBe(true);
      expect(state.coins).toBe(0);
      expect(state.health).toBe("normal");
      expect(state.sickDayCount).toBe(0);
    });

    it("rejects purchase when insufficient coins", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      const result = engine.buy("food");
      expect(result).toBe(false);
    });
  });

  describe("steps", () => {
    it("addSteps increments coins", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      engine.addSteps(500);
      const state = engine.getState();
      expect(state.coins).toBe(Math.floor(500 / STEPS_PER_COIN));
    });
  });

  describe("reset", () => {
    it("resets all state to defaults", () => {
      const a = createAdapter();
      const engine = makeEngine(a);
      engine.addSteps(500);
      engine.buy("food");
      engine.addSteps(500);
      engine.buy("toy");
      engine.reset();
      const state = engine.getState();
      expect(state.hunger).toBe(HUNGER_MAX);
      expect(state.joy).toBe(JOY_MAX);
      expect(state.health).toBe("normal");
      expect(state.age).toBe(0);
      expect(state.coins).toBe(0);
    });
  });

  describe("death", () => {
    it("sets health to dead after zero stat seconds", () => {
      const saved = makeSaved({
        hunger: 0,
        joy: 0,
        age: 10,
        coins: 100,
        coinsSpent: 0,
        totalLifetimeSteps: 100,
        lastSaveTimestamp: BASE_TIME - DEATH_ZERO_STAT_SECONDS * SECOND,
        zeroStatSeconds: DEATH_ZERO_STAT_SECONDS - 1,
        lastSicknessCheckDate: "2026-06-12",
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.health).toBe("dead");
    });

    it("preserves state when dead", () => {
      const saved = makeSaved({
        hunger: 0,
        joy: 0,
        age: 10,
        coins: 100,
        coinsSpent: 0,
        totalLifetimeSteps: 100 * STEPS_PER_COIN,
        lastSaveTimestamp: BASE_TIME - DEATH_ZERO_STAT_SECONDS * SECOND,
        zeroStatSeconds: DEATH_ZERO_STAT_SECONDS - 1,
        lastSicknessCheckDate: "2026-06-12",
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.age).toBe(10);
      expect(state.coins).toBe(100);
    });

    it("blocks petting when dead", () => {
      const saved = makeSaved({
        hunger: 0,
        joy: 0,
        health: "dead",
        age: 10,
        coins: 100,
        coinsSpent: 0,
        totalLifetimeSteps: 100,
        lastSaveTimestamp: BASE_TIME,
        zeroStatSeconds: DEATH_ZERO_STAT_SECONDS,
        lastSicknessCheckDate: "2026-06-14",
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      for (let i = 0; i < 100; i++) engine.pet();
      expect(engine.getState().health).toBe("dead");
    });

    it("blocks buying when dead", () => {
      const saved = makeSaved({
        hunger: 0,
        joy: 0,
        health: "dead",
        age: 10,
        coins: 100,
        coinsSpent: 0,
        totalLifetimeSteps: 100,
        lastSaveTimestamp: BASE_TIME,
        zeroStatSeconds: DEATH_ZERO_STAT_SECONDS,
        lastSicknessCheckDate: "2026-06-14",
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      expect(engine.buy("food")).toBe(false);
      expect(engine.buy("medicine")).toBe(false);
    });

    it("reset revives with fresh state", () => {
      const saved = makeSaved({
        hunger: 0,
        joy: 0,
        health: "dead",
        age: 10,
        coins: 100,
        coinsSpent: 0,
        totalLifetimeSteps: 100,
        lastSaveTimestamp: BASE_TIME,
        zeroStatSeconds: DEATH_ZERO_STAT_SECONDS,
        lastSicknessCheckDate: "2026-06-14",
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      engine.reset();
      const state = engine.getState();
      expect(state.health).toBe("normal");
      expect(state.age).toBe(0);
      expect(state.hunger).toBe(HUNGER_MAX);
    });
  });

  describe("time decay", () => {
    it("sick state doubles decay rate", () => {
      const saved = makeSaved({
        health: "sick",
        lastSaveTimestamp: BASE_TIME - 1 * HOUR,
      });
      const a = createAdapter({ savedState: saved });
      const engine = makeEngine(a);
      const state = engine.getState();
      expect(state.hunger).toBe(HUNGER_MAX - 1 * HUNGER_DECAY_PER_HOUR_SICK);
      expect(state.joy).toBe(JOY_MAX - 1 * JOY_DECAY_PER_HOUR_SICK);
    });
  });
});
