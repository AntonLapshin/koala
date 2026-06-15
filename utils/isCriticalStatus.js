export function isCriticalStatus(state, hungerThreshold, joyThreshold) {
  return (
    state.health === "sick" ||
    state.hunger < hungerThreshold ||
    state.joy < joyThreshold
  );
}
