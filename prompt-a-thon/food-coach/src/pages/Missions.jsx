import { useApp } from "../context/AppContext";
import { getCurrentMission, missionTemplates } from "../data/missionTemplates";

export default function Missions() {
  const { userProfile, missionProgress, checkInMission } = useApp();
  const currentMission = getCurrentMission(userProfile.startDate);
  const { checkIns, currentStreak, lastCheckIn } = missionProgress;

  const todayStr = new Date().toDateString();
  const checkedInToday = lastCheckIn === todayStr;
  const progressCount = checkIns.filter(d => {
    const missionStart = userProfile.startDate ? new Date(userProfile.startDate) : new Date();
    const dDate = new Date(d);
    return dDate >= missionStart && dDate <= new Date();
  }).length;
  const progressPct = Math.min(100, (progressCount / currentMission.target) * 100);

  const weekIndex = currentMission.week - 1;

  return (
    <div className="page">
      <div className="page-header">
        <div className="greeting">🎯 MISSIONS</div>
        <h1>Weekly Challenge</h1>
        <p className="subtitle">Small habits, big results</p>
      </div>

      {/* Current Mission Card */}
      <div className="mission-weekly-card">
        <div className="mission-header">
          <div className="mission-emoji-big">{currentMission.emoji}</div>
          <div>
            <div className="mission-week">Week {currentMission.week} of 12</div>
            <div className="mission-title">{currentMission.title}</div>
          </div>
        </div>

        <div className="mission-why">📖 {currentMission.why}</div>

        <div style={{marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <span className="text-sm text-secondary">{currentMission.challenge}</span>
            <span style={{fontWeight:700, color:'var(--accent)', fontSize:'0.9rem'}}>{progressCount}/{currentMission.target}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width:`${progressPct}%`, background: currentMission.color}} />
          </div>
          <div className="text-xs text-muted mt-2">{currentMission.unit}</div>
        </div>

        {/* Streak */}
        {currentStreak > 0 && (
          <div style={{marginBottom:14}}>
            <div className="streak-badge">
              🔥 {currentStreak}-day streak — Keep going!
            </div>
          </div>
        )}

        {/* Check-in button */}
        {checkedInToday ? (
          <div style={{
            background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)',
            borderRadius:'var(--radius-sm)', padding:'14px', textAlign:'center'
          }}>
            <span style={{color:'var(--accent)', fontWeight:700}}>✅ Checked in today!</span>
            <p className="text-xs text-muted mt-2">Come back tomorrow to continue your streak</p>
          </div>
        ) : (
          <button className="btn btn-primary btn-full" onClick={checkInMission}>
            ✅ Mark Today's Goal Complete
          </button>
        )}
      </div>

      {/* 12-week overview */}
      <div className="section-header">
        <h3 style={{fontSize:'0.9rem'}}>12-Week Journey</h3>
        <span className="badge badge-purple">WEEK {currentMission.week}</span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {missionTemplates.map((m, i) => {
          const isPast = i < weekIndex;
          const isCurrent = i === weekIndex;
          const isFuture = i > weekIndex;
          return (
            <div key={m.week} className="card" style={{
              padding:'14px 16px', display:'flex', alignItems:'center', gap:14,
              opacity: isFuture ? 0.5 : 1,
              borderColor: isCurrent ? 'rgba(34,197,94,0.4)' : 'var(--border)',
              background: isCurrent ? 'linear-gradient(135deg, var(--bg-card), rgba(34,197,94,0.06))' : 'var(--bg-card)',
            }}>
              <div style={{
                width:40, height:40, borderRadius:'var(--radius-sm)',
                background: isPast ? 'rgba(34,197,94,0.15)' : isCurrent ? m.color + '22' : 'rgba(255,255,255,0.04)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.2rem', flexShrink:0
              }}>
                {isPast ? "✅" : m.emoji}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:8}}>
                  {m.title}
                  {isCurrent && <span className="badge badge-green" style={{fontSize:'0.65rem'}}>CURRENT</span>}
                </div>
                <div className="text-xs text-muted">{m.goal.slice(0, 58)}...</div>
              </div>
              <div style={{
                fontSize:'0.7rem', fontWeight:700,
                color: isPast ? 'var(--accent)' : 'var(--text-muted)',
              }}>W{m.week}</div>
            </div>
          );
        })}
      </div>

      {/* Evidence callout */}
      <div className="card mt-4" style={{borderColor:'rgba(6,182,212,0.2)', background:'rgba(6,182,212,0.05)'}}>
        <div style={{fontSize:'1.2rem', marginBottom:8}}>🔬</div>
        <h3 style={{fontSize:'0.9rem', marginBottom:6}}>Evidence-Based Design</h3>
        <p className="text-xs text-secondary" style={{lineHeight:1.6}}>
          This 12-week mission structure is inspired by the <strong>HAPPY Trial</strong> (mHealth for Type 2 Diabetes) and the <strong>eNutri EatWellUK RCT</strong>, both of which showed that structured, weekly nutrition tasks significantly improve diet quality and health outcomes.
        </p>
      </div>
    </div>
  );
}
