import { hashStr } from "../utils/hashStr.js";
import { formatDate } from "../utils/formatDate.js";
import { RESCUE_CHANCE_PER_HOUR } from "./constants.js";

export function checkForRescue(state, nowMs) {
  const date = new Date(nowMs);
  const todayDate = formatDate(date);
  const hour = date.getHours();
  const hourKey = `${todayDate}T${hour}`;

  if (state.rescuePending) {
    return {
      won: true,
      sceneIndex: state.rescueSceneIndex || 0,
      alreadyPending: true,
    };
  }

  if (state.lastRescueCheckHour === hourKey) {
    return { alreadyChecked: true };
  }

  state.lastRescueCheckHour = hourKey;

  const firstRescue = (state.rescueCount || 0) === 0;
  const hash = hashStr(hourKey);
  const won = firstRescue || hash % 100 < RESCUE_CHANCE_PER_HOUR * 100;

  if (won) {
    const sceneIndex = hash % 4;
    state.rescuePending = true;
    state.rescueSceneIndex = sceneIndex;
    return { won: true, sceneIndex };
  }

  return { won: false };
}

export function recordRescue(state) {
  state.rescueCount = (state.rescueCount || 0) + 1;
  state.rescuePending = false;
}
