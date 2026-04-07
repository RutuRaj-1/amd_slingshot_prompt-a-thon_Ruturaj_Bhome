// Scoring Engine — Health + Personal Fit + Context Fit composite

import { getContextFitScore } from "./contextEngine";

// --- Health Score (0-100) ---
export const getHealthScore = (meal) => {
  if (meal.healthScore !== undefined) return meal.healthScore;

  const nutriScoreMap = { A: 100, B: 80, C: 60, D: 40, E: 20 };
  let score = nutriScoreMap[meal.nutriScore] || 50;

  // NOVA group adjustment
  if (meal.novaGroup === 1) score += 10;
  if (meal.novaGroup === 3) score -= 10;
  if (meal.novaGroup === 4) score -= 20;

  // Nutrient penalties
  const n = meal.nutrients || {};
  if (n.sugar > 20) score -= 15;
  if (n.salt > 1.5) score -= 10;
  if (n.fiber > 6) score += 8;
  if (n.protein > 15) score += 5;

  return Math.min(100, Math.max(0, Math.round(score)));
};

// --- Personal Fit Score (0-100) ---
export const getPersonalFitScore = (meal, userProfile, behaviorLog = []) => {
  if (!userProfile) return 50;
  let score = 60;

  const { dietType, allergies = [], dislikedIngredients = [], goals = [] } = userProfile;

  // Hard constraints
  if (dietType === "vegan" && !meal.tags.includes("vegan")) return 0;
  if (dietType === "vegetarian" && !meal.tags.includes("vegetarian") && !meal.tags.includes("vegan")) return 0;
  if (dietType === "keto" && meal.nutrients?.carbs > 20) score -= 30;

  // Check allergies
  const mealTagsLower = meal.tags.map(t => t.toLowerCase());
  for (const allergy of allergies) {
    if (mealTagsLower.includes(allergy.toLowerCase()) || meal.name.toLowerCase().includes(allergy.toLowerCase())) {
      return 0; // Hard block
    }
  }

  // Goals alignment
  if (goals.includes("weight-loss") && meal.nutrients?.calories < 350) score += 15;
  if (goals.includes("muscle") && meal.nutrients?.protein > 20) score += 20;
  if (goals.includes("energy") && meal.tags.includes("high-energy")) score += 15;
  if (goals.includes("gut-health") && (meal.tags.includes("high-fiber") || meal.tags.includes("fermented") || meal.tags.includes("probiotic"))) score += 15;

  // Budget fit
  if (userProfile.dailyBudget && meal.cost > userProfile.dailyBudget / 2) score -= 15;

  // Behavior log adjustments
  const mealLog = behaviorLog.filter(b => b.mealId === meal.id);
  const chosen = mealLog.filter(b => b.action === "chosen").length;
  const rejected = mealLog.filter(b => b.action === "rejected").length;
  score += chosen * 8;
  score -= rejected * 15;

  return Math.min(100, Math.max(0, Math.round(score)));
};

// --- Composite Score ---
export const getCompositeScore = (meal, userProfile, behaviorLog, timeOfDay, location) => {
  const hScore = getHealthScore(meal);
  const pScore = getPersonalFitScore(meal, userProfile, behaviorLog);
  const cScore = getContextFitScore(meal, timeOfDay, location);

  if (pScore === 0) return 0; // Hard block

  return Math.round(0.40 * hScore + 0.35 * pScore + 0.25 * cScore);
};

// --- Score color helper ---
export const getScoreColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

export const getNutriScoreColor = (score) => {
  const colors = { A: "#038141", B: "#85bb2f", C: "#fecb00", D: "#ee8100", E: "#e63312" };
  return colors[score] || "#64748b";
};

// --- Diet Quality Score over time ---
export const computeDietQualityScore = (behaviorLog, missionProgress) => {
  if (!behaviorLog || behaviorLog.length === 0) return 55;

  const recent = behaviorLog.filter(b => b.action === "chosen").slice(-14);
  if (recent.length === 0) return 55;

  // Average health score of chosen meals
  const avgHealth = recent.reduce((sum, b) => sum + (b.healthScore || 50), 0) / recent.length;

  // Ultra-processed ratio penalty
  const ultraProcessed = recent.filter(b => b.novaGroup === 4).length;
  const novaPenalty = (ultraProcessed / recent.length) * 20;

  // Mission completion bonus
  const missionBonus = (missionProgress || 0) * 5;

  return Math.min(100, Math.max(0, Math.round(avgHealth - novaPenalty + missionBonus)));
};
