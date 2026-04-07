export const missionTemplates = [
  {
    week: 1,
    title: "Veggie Boost",
    emoji: "🥦",
    goal: "Add one serving of vegetables at lunch or dinner",
    why: "Vegetables are rich in fiber, vitamins, and antioxidants. Even one extra serving a day can significantly improve your diet quality score.",
    challenge: "Include a vegetable in at least 5 meals this week",
    target: 5,
    unit: "meals with veggies",
    category: "vegetables",
    color: "#22c55e"
  },
  {
    week: 2,
    title: "Whole Grain Switch",
    emoji: "🌾",
    goal: "Swap refined grains for whole grains in one meal daily",
    why: "Whole grains have more fiber and nutrients than refined versions. Brown rice, whole wheat roti, or oats over white rice or maida.",
    challenge: "Choose whole grains 5 times this week",
    target: 5,
    unit: "whole grain choices",
    category: "grains",
    color: "#d97706"
  },
  {
    week: 3,
    title: "Sugar Detox",
    emoji: "🚫",
    goal: "Replace one sugary drink daily with water, nimbu pani, or chai (no sugar)",
    why: "Sugary beverages are the #1 source of empty calories. Cutting them is one of the fastest ways to improve your health score.",
    challenge: "Skip sugary drinks for 5 days",
    target: 5,
    unit: "sugar-free days",
    category: "sugar",
    color: "#ef4444"
  },
  {
    week: 4,
    title: "Protein Priority",
    emoji: "💪",
    goal: "Include a quality protein source in every meal",
    why: "Protein keeps you full longer and supports muscle health. Dal, paneer, eggs, curd, sprouts — all count!",
    challenge: "Hit protein target in 5 meals this week",
    target: 5,
    unit: "protein-rich meals",
    category: "protein",
    color: "#8b5cf6"
  },
  {
    week: 5,
    title: "Snack Smart",
    emoji: "🥜",
    goal: "Replace one packaged snack with a whole-food snack daily",
    why: "Ultra-processed snacks (NOVA 4) spike your blood sugar and leave you hungrier. Swap to nuts, fruit, or sprouts.",
    challenge: "Choose healthy snacks 5 times",
    target: 5,
    unit: "smart snack swaps",
    category: "snacks",
    color: "#f59e0b"
  },
  {
    week: 6,
    title: "Mindful Portions",
    emoji: "🍽️",
    goal: "Eat without screens and pause halfway through your meal",
    why: "Mindful eating reduces overeating by 20%. It takes 20 minutes for your brain to register fullness.",
    challenge: "Practice mindful eating 5 times",
    target: 5,
    unit: "mindful meals",
    category: "mindfulness",
    color: "#06b6d4"
  },
  {
    week: 7,
    title: "Hydration Hero",
    emoji: "💧",
    goal: "Drink at least 8 glasses of water daily",
    why: "Dehydration is often mistaken for hunger. Proper hydration improves energy, digestion, and skin health.",
    challenge: "Hit 8 glasses for 5 days",
    target: 5,
    unit: "hydrated days",
    category: "hydration",
    color: "#3b82f6"
  },
  {
    week: 8,
    title: "Cook at Home",
    emoji: "🏠",
    goal: "Cook at least one meal at home every day",
    why: "Home-cooked meals have 60% fewer calories on average than restaurant food. You control what goes in.",
    challenge: "Cook at home 5 days this week",
    target: 5,
    unit: "home-cooked meals",
    category: "cooking",
    color: "#10b981"
  },
  {
    week: 9,
    title: "Legume Love",
    emoji: "🫘",
    goal: "Include legumes (dal, rajma, chana, sprouts) in at least one meal daily",
    why: "Legumes are India's superfood — complete plant protein, high fiber, and blood-sugar friendly.",
    challenge: "Eat legumes 5 times this week",
    target: 5,
    unit: "legume meals",
    category: "legumes",
    color: "#a16207"
  },
  {
    week: 10,
    title: "Fruit First",
    emoji: "🍎",
    goal: "Eat one whole fruit per day (not juice)",
    why: "Whole fruits have fiber that slows sugar absorption. Fruit juice removes most of this benefit.",
    challenge: "Eat a whole fruit 5 days",
    target: 5,
    unit: "fruit servings",
    category: "fruits",
    color: "#f43f5e"
  },
  {
    week: 11,
    title: "Salt Watch",
    emoji: "🧂",
    goal: "Reduce salt in one meal and taste food before adding more",
    why: "Excess sodium raises blood pressure. The WHO recommends under 5g/day — most Indians eat 8-10g.",
    challenge: "Mindful of salt for 5 meals",
    target: 5,
    unit: "low-sodium meals",
    category: "sodium",
    color: "#64748b"
  },
  {
    week: 12,
    title: "Rainbow Challenge",
    emoji: "🌈",
    goal: "Eat 5 different colored fruits/vegetables in a day",
    why: "Different colors = different phytonutrients. A rainbow plate ensures you get maximum micronutrient diversity.",
    challenge: "Eat 5 colors in 3 days this week",
    target: 3,
    unit: "rainbow days",
    category: "diversity",
    color: "#a855f7"
  }
];

export const getCurrentMission = (startDate) => {
  if (!startDate) return missionTemplates[0];
  const weeksElapsed = Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const index = Math.min(weeksElapsed, missionTemplates.length - 1);
  return missionTemplates[index];
};
