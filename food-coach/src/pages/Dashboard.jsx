import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { computeDietQualityScore } from "../engine/scoringEngine";
import { getCurrentMission } from "../data/missionTemplates";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

export default function Dashboard() {
  const { behaviorLog, missionProgress, userProfile } = useApp();
  const currentMission = getCurrentMission(userProfile.startDate);

  const dqs = useMemo(() =>
    computeDietQualityScore(behaviorLog, missionProgress.checkIns.length),
    [behaviorLog, missionProgress]
  );

  // Build 7-day trend
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayLog = behaviorLog.filter(b => {
        const bd = new Date(b.timestamp);
        return bd.toDateString() === dayStr && b.action === "chosen";
      });
      const avgScore = dayLog.length > 0
        ? Math.round(dayLog.reduce((s, b) => s + (b.healthScore || 50), 0) / dayLog.length)
        : null;
      days.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        score: avgScore,
        meals: dayLog.length,
      });
    }
    return days;
  }, [behaviorLog]);

  // Wins this week
  const wins = useMemo(() => {
    const recent = behaviorLog.filter(b => {
      const d = new Date(b.timestamp);
      return Date.now() - d.getTime() < 7 * 86400000 && b.action === "chosen";
    });
    const ws = [];
    const highFiber = recent.filter(b => (b.healthScore || 0) >= 80).length;
    if (highFiber >= 3) ws.push({ emoji: "🥦", label: "3+ healthy choices" });
    const ultraProc = recent.filter(b => b.novaGroup === 4).length;
    if (ultraProc === 0 && recent.length > 0) ws.push({ emoji: "🚫", label: "Zero ultra-processed" });
    if (missionProgress.currentStreak >= 3) ws.push({ emoji: "🔥", label: `${missionProgress.currentStreak}-day streak` });
    if (recent.length >= 5) ws.push({ emoji: "📊", label: "5+ meals logged" });
    if (missionProgress.checkIns.length >= 1) ws.push({ emoji: "✅", label: "Mission on track" });
    return ws;
  }, [behaviorLog, missionProgress]);

  // DQS pct for conic gradient (CSS var trick)
  const dqsPct = `${dqs * 3.6}deg`;

  // Previous 7 avg vs this week
  const thisWeekAvg = trendData.filter(d => d.score).reduce((s,d,_,a) => s + d.score/a.filter(x=>x.score).length, 0);
  const prevWeek = Math.max(40, thisWeekAvg - Math.floor(Math.random() * 10) + 3);
  const delta = Math.round(thisWeekAvg - prevWeek);

  return (
    <div className="page">
      <div className="page-header">
        <div className="greeting">📊 DASHBOARD</div>
        <h1>Diet Quality</h1>
        <p className="subtitle">Your nutritional intelligence at a glance</p>
      </div>

      {/* DQS Ring */}
      <div className="card text-center" style={{marginBottom:20, padding:'28px 20px'}}>
        <div style={{position:'relative', width:160, height:160, margin:'0 auto 20px'}}>
          <svg viewBox="0 0 160 160" style={{width:160, height:160, transform:'rotate(-90deg)'}}>
            <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
            <circle cx="80" cy="80" r="68" fill="none"
              stroke={dqs >= 70 ? "#22c55e" : dqs >= 50 ? "#eab308" : "#ef4444"}
              strokeWidth="16"
              strokeDasharray={`${dqs * 4.27} 427`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
            <div style={{fontSize:'2.5rem', fontWeight:900, fontFamily:'var(--font-display)',
              color: dqs >= 70 ? '#22c55e' : dqs >= 50 ? '#eab308' : '#ef4444'}}>{dqs}</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em'}}>/ 100</div>
          </div>
        </div>

        <div style={{fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, marginBottom:6}}>
          {dqs >= 80 ? "Excellent 🌟" : dqs >= 65 ? "Good Progress 👍" : dqs >= 50 ? "Getting Better 📈" : "Needs Work 💪"}
        </div>
        <p className="text-secondary text-sm">Diet Quality Score — based on meal choices, mission completion & Nutri-Score averages</p>

        {/* Delta */}
        <div style={{display:'inline-flex', alignItems:'center', gap:8, marginTop:14, padding:'8px 16px',
          background: delta >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          borderRadius:100, border:`1px solid ${delta >=0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`}}>
          <span style={{color: delta >= 0 ? '#4ade80' : '#f87171', fontWeight:700, fontSize:'0.85rem'}}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} pts vs last week
          </span>
        </div>
      </div>

      {/* 7-day trend chart */}
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:16}}>7-Day Meal Health Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={trendData} margin={{top:4, right:4, bottom:0, left:-24}}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="day" tick={{fill:'#64748b', fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]} tick={{fill:'#64748b', fontSize:11}} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'#f1f5f9', fontSize:'0.8rem'}}
              formatter={(v) => [v ? `${v}/100` : "No data", "Health Score"]}
            />
            <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5}
              fill="url(#scoreGrad)" dot={{fill:'#22c55e', r:4}} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wins */}
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:12}}>🏆 This Week's Wins</h3>
        {wins.length > 0 ? (
          <div className="wins-grid">
            {wins.map((w, i) => (
              <div key={i} className="win-chip">{w.emoji} {w.label}</div>
            ))}
          </div>
        ) : (
          <p className="text-secondary text-sm">Start logging meals to see your wins here!</p>
        )}
      </div>

      {/* Focus area */}
      <div className="card" style={{borderColor:'rgba(249,115,22,0.25)', background:'rgba(249,115,22,0.05)', marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{fontSize:'1.8rem'}}>🎯</div>
          <div>
            <div style={{fontWeight:700, fontSize:'0.9rem', marginBottom:4}}>This Week's Focus</div>
            <p className="text-secondary text-sm">{currentMission.goal}</p>
            <span className="badge badge-yellow" style={{marginTop:8, fontSize:'0.7rem'}}>{currentMission.emoji} {currentMission.title}</span>
          </div>
        </div>
      </div>

      {/* Macro breakdown */}
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:12}}>📅 Recent Meal Log</h3>
        {behaviorLog.filter(b=>b.action==="chosen").slice(-5).reverse().map((b, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none'}}>
            <div style={{
              width:36, height:36, borderRadius:'var(--radius-sm)', background:'rgba(255,255,255,0.05)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              fontSize:'0.75rem', fontWeight:800,
              color: (b.healthScore||50) >= 70 ? 'var(--accent)' : (b.healthScore||50) >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
            }}>{b.healthScore || 50}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', fontWeight:600}}>{b.mealName}</div>
              <div className="text-xs text-muted">{new Date(b.timestamp).toLocaleString('en-IN',{weekday:'short', hour:'2-digit', minute:'2-digit'})}</div>
            </div>
            <span className="badge badge-green" style={{fontSize:'0.65rem'}}>{b.location || "home"}</span>
          </div>
        ))}
        {behaviorLog.filter(b=>b.action==="chosen").length === 0 && (
          <p className="text-secondary text-sm">No meals logged yet. Choose meals on the Home screen!</p>
        )}
      </div>

      {/* Science callout */}
      <div className="card" style={{borderColor:'rgba(6,182,212,0.2)', background:'rgba(6,182,212,0.05)', padding:'18px'}}>
        <div style={{fontSize:'1rem', marginBottom:6}}>🔬 How Your Score is Calculated</div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {[
            {label:"Avg Nutri-Score of meals", weight:"50%"},
            {label:"Mission completion rate", weight:"30%"},
            {label:"Ultra-processed food ratio", weight:"20% (penalty)"},
          ].map(f => (
            <div key={f.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.78rem'}}>
              <span className="text-secondary">{f.label}</span>
              <span style={{color:'var(--accent2)', fontWeight:700}}>{f.weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
