import { setStorageSync, getStorageSync } from '@zos/storage';

const STORAGE_KEY = 'koala_state';

export const storageAdapter = {
  load() {
    try {
      const raw = getStorageSync(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  save(state) {
    try {
      setStorageSync(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Silently fail on storage errors
    }
  },
};
