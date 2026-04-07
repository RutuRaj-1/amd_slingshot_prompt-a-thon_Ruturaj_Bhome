import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { seedMeals } from "../data/seedMeals";
import { getTimeOfDay, getContextLabel, getContextEmoji, getContextFitScore } from "../engine/contextEngine";
import { getCompositeScore, getHealthScore, getPersonalFitScore, getScoreColor, getNutriScoreColor } from "../engine/scoringEngine";
import { getCurrentMission } from "../data/missionTemplates";

export default function Home() {
  const { userProfile, behaviorLog, logMealAction, context, missionProgress } = useApp();
  const { location, simulatedTime } = context;

  const timeOfDay = simulatedTime || getTimeOfDay();
  const currentMission = getCurrentMission(userProfile.startDate);
  const streak = missionProgress.currentStreak;
  const checkIns = missionProgress.checkIns.length;

  const rankedMeals = useMemo(() => {
    return seedMeals
      .map(m => ({
        ...m,
        compositeScore: getCompositeScore(m, userProfile, behaviorLog, timeOfDay, location),
        hScore: getHealthScore(m),
        pScore: getPersonalFitScore(m, userProfile, behaviorLog),
        cScore: getContextFitScore(m, timeOfDay, location),
      }))
      .filter(m => m.compositeScore > 0)
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 5);
  }, [userProfile, behaviorLog, timeOfDay, location]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="greeting">
          {getContextEmoji(timeOfDay, location)} {timeOfDay.toUpperCase()}
        </div>
        <h1>
          {userProfile.name ? `Hey, ${userProfile.name.split(" ")[0]}! 👋` : "Your Food Coach"}
        </h1>
        <p className="subtitle">{getContextLabel(timeOfDay, location)}</p>
      </div>

      {/* Mission nudge */}
      {currentMission && (
        <div className="nudge-banner">
          <div className="nudge-icon">{currentMission.emoji}</div>
          <div className="nudge-text">
            <strong>Week {currentMission.week} Mission: {currentMission.title}</strong>
            {currentMission.goal}
            {streak > 0 && <span className="badge badge-yellow" style={{marginLeft:8, fontSize:'0.7rem'}}>🔥 {streak}-day streak</span>}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="section-header">
        <h2 style={{fontSize:'1rem'}}>Smart Picks for Now</h2>
        <span className="badge badge-blue" style={{fontSize:'0.7rem'}}>RANKED BY AI</span>
      </div>

      {rankedMeals.map(meal => (
        <MealCard key={meal.id} meal={meal} onAction={logMealAction} />
      ))}

      {rankedMeals.length === 0 && (
        <div className="card text-center" style={{padding:'48px 24px'}}>
          <div style={{fontSize:'3rem', marginBottom:12}}>🤔</div>
          <p className="text-secondary">No perfect matches right now.<br/>Try switching context in Profile!</p>
        </div>
      )}

      {/* Quick stats strip */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:8}}>
        <div className="card text-center" style={{padding:'14px 8px'}}>
          <div style={{fontSize:'1.3rem', fontWeight:800, color:'var(--accent)'}}>{checkIns}</div>
          <div className="text-xs text-muted">Check-ins</div>
        </div>
        <div className="card text-center" style={{padding:'14px 8px'}}>
          <div style={{fontSize:'1.3rem', fontWeight:800, color:'var(--accent-orange)'}}>🔥{streak}</div>
          <div className="text-xs text-muted">Day Streak</div>
        </div>
        <div className="card text-center" style={{padding:'14px 8px'}}>
          <div style={{fontSize:'1.3rem', fontWeight:800, color:'var(--accent2)'}}>{behaviorLog.filter(b=>b.action==='chosen').length}</div>
          <div className="text-xs text-muted">Meals Logged</div>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, onAction }) {
  const hColor = getScoreColor(meal.hScore);
  const pColor = getScoreColor(meal.pScore);
  const cColor = getScoreColor(meal.cScore);
  const nsColor = getNutriScoreColor(meal.nutriScore);

  return (
    <div className="meal-card">
      <div style={{position:'relative'}}>
        <img
          src={meal.image}
          alt={meal.name}
          className="meal-card-img"
          onError={e => { e.target.style.display='none'; }}
        />
        {/* Top badges */}
        <div style={{position:'absolute', top:12, left:12, display:'flex', gap:8}}>
          <div className={`nutri-badge nutri-${meal.nutriScore}`}>{meal.nutriScore}</div>
          {meal.novaGroup === 4 && <span className="badge badge-red" style={{fontSize:'0.65rem'}}>Ultra-processed</span>}
          {meal.novaGroup === 1 && <span className="badge badge-green" style={{fontSize:'0.65rem'}}>Unprocessed</span>}
        </div>
        {/* Composite score */}
        <div style={{
          position:'absolute', top:12, right:12,
          background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)',
          borderRadius:50, padding:'6px 12px', display:'flex', alignItems:'center', gap:6
        }}>
          <span style={{fontSize:'1rem', fontWeight:800, color: getScoreColor(meal.compositeScore)}}>{meal.compositeScore}</span>
          <span style={{fontSize:'0.65rem', color:'#999'}}>/ 100</span>
        </div>
      </div>

      <div className="meal-card-body">
        <div className="meal-card-title">{meal.emoji} {meal.name}</div>
        <div className="meal-card-meta">
          {meal.nutrients.calories} kcal · {meal.prepTime > 0 ? `${meal.prepTime}min prep` : "Ready to eat"} · ₹{meal.cost}
        </div>

        {/* Three scores */}
        <div className="meal-scores">
          {[
            { label: "Health", score: meal.hScore, color: hColor },
            { label: "Personal", score: meal.pScore, color: pColor },
            { label: "Context", score: meal.cScore, color: cColor },
          ].map(s => (
            <div key={s.label} className="score-pill">
              <div className="score-num" style={{color: s.color}}>{s.score}</div>
              <div className="score-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div className="meal-card-explanation">💡 {meal.explanation}</div>

        {/* Action buttons */}
        <div className="meal-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onAction(meal, "chosen")}>✅ Choose</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAction(meal, "maybe")}>⏱ Later</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAction(meal, "rejected")}>❌ Skip</button>
        </div>
      </div>
    </div>
  );
}
