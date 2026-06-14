import {
  HUNGER_DECAY_PER_HOUR,
  HUNGER_DECAY_PER_HOUR_SICK,
  JOY_DECAY_PER_HOUR,
  JOY_DECAY_PER_HOUR_SICK,
  HUNGER_MAX,
  JOY_MAX,
  STORE_FOOD_COST,
  STORE_FOOD_HUNGER,
  STORE_TOY_COST,
  STORE_TOY_JOY,
  STORE_MEDICINE_COST,
  STEPS_PER_COIN,
  PET_TAPS_FOR_BONUS,
  PET_HUNGER_BONUS,
  PET_JOY_BONUS,
  SICK_PET_TAPS_TO_CURE,
  MAX_AGE,
  STUNTED_HUNGER_THRESHOLD,
  STUNTED_JOY_THRESHOLD,
  NEGLECT_THRESHOLD,
  DAILY_SICKNESS_CHANCE,
  NEGLECT_SICKNESS_CHANCE,
  DEATH_ZERO_STAT_HOURS,
} from './constants.js';

function getTodayDate(getTime) {
  const d = new Date(getTime());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function randomEggIndex() {
  return Math.floor(Math.random() * MAX_AGE) + 1;
}

function createDefaultState() {
  return {
    hunger: HUNGER_MAX,
    joy: JOY_MAX,
    health: 'normal',
    age: 0,
    eggIndex: randomEggIndex(),
    coins: 0,
    coinsSpent: 0,
    totalLifetimeSteps: 0,
    todayStepCount: 0,
    lastStepDate: '',
    lastSaveTimestamp: 0,
    sickDayCount: 0,
    tapCounter: 0,
    zeroStatHours: 0,
    lastSicknessCheckDate: '',
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createGameEngine({ storage, getTime, getSteps }) {
  let state = null;

  function init() {
    const saved = storage.load();
    if (saved && typeof saved === 'object' && saved.lastSaveTimestamp != null) {
      state = saved;
      applyTimeDecay();
    } else {
      state = createDefaultState();
      state.lastSaveTimestamp = getTime();
      state.lastStepDate = getTodayDate(getTime);
      state.lastSicknessCheckDate = getTodayDate(getTime);
    }
    syncSteps();
  }

  function applyTimeDecay() {
    if (state.health === 'dead') return;

    const elapsedMs = getTime() - state.lastSaveTimestamp;
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));

    if (elapsedHours <= 0) return;

    const todayDate = getTodayDate(getTime);
    const prevDate = getTodayDate(() => state.lastSaveTimestamp);

    if (todayDate !== prevDate) {
      handleDailyReset(todayDate, prevDate);
    }

    checkSicknessToday(todayDate);

    const hungerRate = state.health === 'sick' ? HUNGER_DECAY_PER_HOUR_SICK : HUNGER_DECAY_PER_HOUR;
    const joyRate = state.health === 'sick' ? JOY_DECAY_PER_HOUR_SICK : JOY_DECAY_PER_HOUR;

    state.hunger = clamp(state.hunger - hungerRate * elapsedHours, 0, HUNGER_MAX);
    state.joy = clamp(state.joy - joyRate * elapsedHours, 0, JOY_MAX);

    trackZeroStats(elapsedHours);
    checkDeath();
  }

  function handleDailyReset(todayDate, prevDate) {
    const daysElapsed = Math.floor(
      (new Date(todayDate).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let d = 0; d < daysElapsed; d++) {
      const prevAge = state.age;

      const isStunted =
        state.health === 'sick' ||
        (state.hunger < STUNTED_HUNGER_THRESHOLD && state.joy < STUNTED_JOY_THRESHOLD);

      if (!isStunted && state.age < MAX_AGE) {
        state.age = Math.min(state.age + 1, MAX_AGE);
      }

      if (state.health === 'sick') {
        state.sickDayCount += 1;
      }
    }

    state.todayStepCount = 0;
    state.lastStepDate = todayDate;
    state.tapCounter = 0;
    state.lastSicknessCheckDate = todayDate;
  }

  function checkSicknessToday(todayDate) {
    if (state.lastSicknessCheckDate === todayDate) return;

    state.lastSicknessCheckDate = todayDate;

    if (state.health === 'sick') return;

    const isNeglected =
      state.hunger < NEGLECT_THRESHOLD || state.joy < NEGLECT_THRESHOLD;
    const chance = isNeglected ? NEGLECT_SICKNESS_CHANCE : DAILY_SICKNESS_CHANCE;

    if (Math.random() < chance) {
      state.health = 'sick';
      state.sickDayCount = 0;
    }
  }

  function trackZeroStats(elapsedHours) {
    if (state.hunger <= 0 && state.joy <= 0) {
      state.zeroStatHours += elapsedHours;
    } else {
      state.zeroStatHours = 0;
    }
  }

  function checkDeath() {
    if (state.zeroStatHours >= DEATH_ZERO_STAT_HOURS) {
      state.health = 'dead';
      save();
    }
  }

  function syncSteps() {
    const todayDate = getTodayDate(getTime);

    if (state.lastStepDate !== todayDate) {
      state.totalLifetimeSteps += state.todayStepCount;
      state.todayStepCount = 0;
      state.lastStepDate = todayDate;
    }

    const deviceSteps = getSteps();
    state.todayStepCount = deviceSteps;

    recalculateCoins();
  }

  function getState() {
    return { ...state };
  }

  function pet() {
    if (state.health === 'dead') return;

    state.tapCounter += 1;

    if (state.health === 'sick') {
      if (state.tapCounter >= SICK_PET_TAPS_TO_CURE) {
        state.health = 'normal';
        state.sickDayCount = 0;
        state.tapCounter = 0;
      }
    } else if (state.tapCounter >= PET_TAPS_FOR_BONUS) {
      state.tapCounter = 0;
      state.hunger = clamp(state.hunger + PET_HUNGER_BONUS, 0, HUNGER_MAX);
      state.joy = clamp(state.joy + PET_JOY_BONUS, 0, JOY_MAX);
    }

    save();
  }

  function buy(item) {
    if (state.health === 'dead') return false;

    switch (item) {
      case 'food':
        if (state.coins < STORE_FOOD_COST) return false;
        state.coins -= STORE_FOOD_COST;
        state.coinsSpent += STORE_FOOD_COST;
        state.hunger = clamp(state.hunger + STORE_FOOD_HUNGER, 0, HUNGER_MAX);
        break;
      case 'toy':
        if (state.coins < STORE_TOY_COST) return false;
        state.coins -= STORE_TOY_COST;
        state.coinsSpent += STORE_TOY_COST;
        state.joy = clamp(state.joy + STORE_TOY_JOY, 0, JOY_MAX);
        break;
      case 'medicine':
        if (state.coins < STORE_MEDICINE_COST) return false;
        state.coins -= STORE_MEDICINE_COST;
        state.coinsSpent += STORE_MEDICINE_COST;
        state.health = 'normal';
        state.sickDayCount = 0;
        break;
      default:
        return false;
    }

    save();
    return true;
  }

  function addSteps(count) {
    state.totalLifetimeSteps += count;
    syncSteps();
    recalculateCoins();
    save();
  }

  function recalculateCoins() {
    const totalSteps = state.totalLifetimeSteps + state.todayStepCount;
    const totalCoinsEarned = Math.floor(totalSteps / STEPS_PER_COIN);
    state.coins = Math.max(0, totalCoinsEarned - state.coinsSpent);
  }

  function save() {
    state.lastSaveTimestamp = getTime();
    storage.save(state);
  }

  function reset() {
    state = createDefaultState();
    state.lastSaveTimestamp = getTime();
    state.lastStepDate = getTodayDate(getTime);
    state.lastSicknessCheckDate = getTodayDate(getTime);
    storage.save(state);
  }

  function tick(hours) {
    if (state.health === 'dead') return;
    applyTimeDecay();
    state.lastSaveTimestamp = getTime();
  }

  return {
    init,
    getState,
    pet,
    buy,
    addSteps,
    save,
    reset,
    tick,
  };
}
