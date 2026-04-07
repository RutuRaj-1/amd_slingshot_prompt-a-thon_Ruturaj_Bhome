// Context Engine — derives time-of-day, location cluster, and context label

export const getTimeOfDay = (hour = new Date().getHours()) => {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "afternoon";
  if (hour >= 15 && hour < 18) return "evening";
  if (hour >= 18 && hour < 22) return "night";
  return "late-night";
};

export const getContextLabel = (timeOfDay, location) => {
  const labels = {
    morning: { home: "Good morning! Ready for breakfast?", office: "Morning commute — grab something quick", any: "Morning fuel time" },
    afternoon: { home: "Lunch time at home", office: "Quick lunch near office", any: "Lunchtime" },
    evening: { home: "Evening snack time", office: "5 PM office snack break 🎯", any: "Snack o'clock" },
    night: { home: "Dinner time", office: "Late dinner — keep it light", any: "Dinner time" },
    "late-night": { home: "Late night — try something light", any: "Late night snack" }
  };
  return (labels[timeOfDay] && labels[timeOfDay][location]) || (labels[timeOfDay] && labels[timeOfDay]["any"]) || "Time to eat";
};

export const getContextFitScore = (meal, timeOfDay, location) => {
  let score = 50;

  // Time of day fit
  if (meal.timeOfDay.includes(timeOfDay)) score += 30;
  else if (
    (timeOfDay === "morning" && meal.category === "breakfast") ||
    (timeOfDay === "afternoon" && meal.category === "lunch") ||
    (timeOfDay === "evening" && meal.category === "snack") ||
    (timeOfDay === "night" && meal.category === "dinner")
  ) score += 20;

  // Location fit
  if (meal.location.includes(location)) score += 20;
  if (location === "office" && meal.prepTime <= 10) score += 10;
  if (location === "home" && meal.prepTime <= 35) score += 5;

  // Contextual adjustments
  if (timeOfDay === "late-night" && meal.nutrients.calories > 400) score -= 20;
  if (timeOfDay === "morning" && meal.nutrients.calories < 350) score += 10;
  if (location === "office" && meal.category === "snack" && meal.cost < 80) score += 10;

  return Math.min(100, Math.max(0, score));
};

export const getContextEmoji = (timeOfDay, location) => {
  if (location === "office") return "🏢";
  if (location === "home") {
    if (timeOfDay === "morning") return "🌅";
    if (timeOfDay === "night") return "🌙";
    return "🏠";
  }
  return "📍";
};

export const getDayType = () => {
  const day = new Date().getDay();
  return (day === 0 || day === 6) ? "weekend" : "weekday";
};
