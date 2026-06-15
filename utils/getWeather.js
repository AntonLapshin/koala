import { hashStr } from "./hashStr.js";

export function getWeather(dateStr) {
  return hashStr(dateStr) % 100 < 30 ? "rain" : "clear";
}
