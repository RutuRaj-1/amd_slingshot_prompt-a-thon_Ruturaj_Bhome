import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AppContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "",
  dietType: "vegetarian",
  allergies: [],
  dislikedIngredients: [],
  goals: ["weight-loss"],
  dailyBudget: 200,
  cookingSkill: "moderate",
  onboarded: false,
  startDate: null,
};

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("fc_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  const [behaviorLog, setBehaviorLog] = useState(() => {
    try {
      const saved = localStorage.getItem("fc_behavior");
      return saved ? JSON.parse(saved) : generateDemoLog();
    } catch { return generateDemoLog(); }
  });

  const [missionProgress, setMissionProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("fc_missions");
      return saved ? JSON.parse(saved) : { checkIns: [], currentStreak: 0, lastCheckIn: null };
    } catch { return { checkIns: [], currentStreak: 0, lastCheckIn: null }; }
  });

  const [context, setContext] = useState({
    location: "home",
    simulatedTime: null, // null = use real time
  });

  const [scanHistory, setScanHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("fc_scans");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Persist to localStorage based on UID if available, else generic. For a hackathon prototype, generic is fine, but prefixing with uid is safer for multi-user.
  useEffect(() => { localStorage.setItem("fc_profile", JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem("fc_behavior", JSON.stringify(behaviorLog)); }, [behaviorLog]);
  useEffect(() => { localStorage.setItem("fc_missions", JSON.stringify(missionProgress)); }, [missionProgress]);
  useEffect(() => { localStorage.setItem("fc_scans", JSON.stringify(scanHistory)); }, [scanHistory]);

  const updateProfile = (updates) => setUserProfile(prev => ({ ...prev, ...updates }));

  const logMealAction = (meal, action) => {
    const entry = {
      mealId: meal.id,
      mealName: meal.name,
      action,
      healthScore: meal.healthScore,
      novaGroup: meal.novaGroup,
      timestamp: Date.now(),
      timeOfDay: context.simulatedTime || undefined,
      location: context.location,
    };
    setBehaviorLog(prev => [...prev.slice(-99), entry]);
  };

  const checkInMission = () => {
    const today = new Date().toDateString();
    if (missionProgress.lastCheckIn === today) return; // Already checked in
    
    const newCheckIns = [...missionProgress.checkIns, today];
    const streak = computeStreak(newCheckIns);
    setMissionProgress({ checkIns: newCheckIns, currentStreak: streak, lastCheckIn: today });
  };

  const addScan = (product) => {
    setScanHistory(prev => [{ ...product, scannedAt: Date.now() }, ...prev.slice(0, 19)]);
  };

  if (authLoading) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{
      user,
      userProfile, updateProfile,
      behaviorLog, logMealAction,
      missionProgress, checkInMission,
      context, setContext,
      scanHistory, addScan,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

function computeStreak(checkIns) {
  if (!checkIns.length) return 0;
  const sorted = [...new Set(checkIns)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i - 1]) - new Date(sorted[i])) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// Generate realistic demo behavior log
function generateDemoLog() {
  const meals = [
    { id: "m3", name: "Dal Tadka", healthScore: 91, novaGroup: 1 },
    { id: "m5", name: "Sprouts Chaat", healthScore: 95, novaGroup: 1 },
    { id: "m7", name: "Idli with Sambar", healthScore: 90, novaGroup: 1 },
    { id: "m16", name: "Moong Dal Cheela", healthScore: 93, novaGroup: 1 },
    { id: "m21", name: "Instant Noodles", healthScore: 18, novaGroup: 4 },
    { id: "m6", name: "Samosa", healthScore: 35, novaGroup: 3 },
    { id: "m12", name: "Rajma Chawal", healthScore: 89, novaGroup: 1 },
    { id: "m11", name: "Greek Yogurt", healthScore: 88, novaGroup: 1 },
  ];
  const log = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const meal = meals[Math.floor(Math.random() * meals.length)];
    log.push({ ...meal, action: "chosen", timestamp: date.getTime() - 43200000, location: "home" });
  }
  return log;
}
