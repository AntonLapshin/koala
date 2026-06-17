import { HUNGER_MAX, JOY_MAX } from "../shared/constants.js";
import { randomEggIndex } from "./randomEggIndex.js";

export function createDefaultState() {
  return {
    hunger: HUNGER_MAX,
    joy: JOY_MAX,
    health: "normal",
    age: 0,
    eggIndex: randomEggIndex(),
    coins: 0,
    coinsSpent: 0,
    totalLifetimeSteps: 0,
    todayStepCount: 0,
    lastStepDate: "",
    lastDecayTimestamp: 0,
    lastSaveTimestamp: 0,
    sickDayCount: 0,
    tapCounter: 0,
    zeroStatSeconds: 0,
    lastSicknessCheckDate: "",
    totalFoodBought: 0,
    totalToysBought: 0,
    totalMedicineBought: 0,
    rescueCount: 0,
    lastRescueCheckHour: "",
    rescuePending: false,
    rescueSceneIndex: 0,
  };
}
