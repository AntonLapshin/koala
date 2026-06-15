export function getBgSrc(timeOfDay) {
  switch (timeOfDay) {
    case "morning":
      return "bg_morning.png";
    case "evening":
      return "bg_evening.png";
    case "night":
      return "bg_night.png";
    default:
      return "bg_day.png";
  }
}
