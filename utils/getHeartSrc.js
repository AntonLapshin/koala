export function getHeartSrc({ health } = {}) {
  if (health === "dead") return "ui/heart_dead.png";
  if (health === "sick") return "ui/heart_sick.png";
  return "ui/heart_health.png";
}
