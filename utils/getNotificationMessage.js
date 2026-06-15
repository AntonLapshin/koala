export function getNotificationMessage(state, hungerThreshold, joyThreshold) {
  if (state.health === "sick") {
    return "Koala is sick!";
  }
  if (state.hunger <= 0 && state.joy <= 0) {
    return "Koala is starving!";
  }
  if (state.hunger < hungerThreshold) {
    return "Koala is hungry!";
  }
  if (state.joy < joyThreshold) {
    return "Koala is lonely!";
  }
  return "";
}
