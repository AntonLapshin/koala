import { useState, useCallback, useRef, useEffect } from 'react';
import { createGameEngine } from '@shared/gameEngine.js';
import { storageAdapter } from '../adapters/storageAdapter.js';
import { timeAdapter } from '../adapters/timeAdapter.js';
import { stepsAdapter } from '../adapters/stepsAdapter.js';

export function useGameLoop() {
  const [state, setState] = useState(null);
  const engineRef = useRef(null);

  const initEngine = useCallback(() => {
    const engine = createGameEngine({
      storage: storageAdapter,
      getTime: timeAdapter.getTime,
      getSteps: stepsAdapter.getSteps,
    });
    engine.init();
    engineRef.current = engine;
    setState(engine.getState());
  }, []);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  const refresh = useCallback(() => {
    if (engineRef.current) {
      setState(engineRef.current.getState());
    }
  }, []);

  const pet = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pet();
      refresh();
    }
  }, [refresh]);

  const buy = useCallback((item) => {
    if (engineRef.current) {
      const result = engineRef.current.buy(item);
      refresh();
      return result;
    }
    return false;
  }, [refresh]);

  const addSteps = useCallback((count) => {
    stepsAdapter.add(count);
    if (engineRef.current) {
      engineRef.current.addSteps(count);
      refresh();
    }
  }, [refresh]);

  const reset = useCallback(() => {
    stepsAdapter.reset();
    timeAdapter.resetOffset();
    if (engineRef.current) {
      engineRef.current.reset();
      refresh();
    }
  }, [refresh]);

  const jumpTime = useCallback((hours) => {
    timeAdapter.addHours(hours);
    if (engineRef.current) {
      engineRef.current.tick(hours);
      refresh();
    }
  }, [refresh]);

  const jumpDays = useCallback((days) => {
    const hours = days * 24;
    timeAdapter.addHours(hours);
    if (engineRef.current) {
      engineRef.current.tick(hours);
      refresh();
    }
  }, [refresh]);

  return {
    state,
    pet,
    buy,
    addSteps,
    reset,
    jumpTime,
    jumpDays,
  };
}
