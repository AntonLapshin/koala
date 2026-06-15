import { MAX_AGE } from "../shared/constants.js";

export function randomEggIndex() {
  return Math.floor(Math.random() * MAX_AGE) + 1;
}
