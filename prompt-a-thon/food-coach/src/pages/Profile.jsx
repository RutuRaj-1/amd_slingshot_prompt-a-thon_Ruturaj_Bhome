import { useApp } from "../context/AppContext";
import { auth } from "../../src/firebase";
import { signOut } from "firebase/auth";
import { getTimeOfDay } from "../engine/contextEngine";

const dietLabels = { omnivore:"🍗 Omnivore", vegetarian:"🥗 Vegetarian", vegan:"🌱 Vegan", keto:"🥩 Keto" };
const goalLabels = { "weight-loss":"⚖️ Weight Loss", energy:"⚡ Energy", muscle:"💪 Muscle", "gut-health":"🧬 Gut Health" };

const timeOptions = ["morning", "afternoon", "evening", "night"];
const locationOptions = ["home", "office", "out"];
const timeEmoji = { morning:"🌅", afternoon:"☀️", evening:"🌆", night:"🌙" };
const locEmoji = { home:"🏠", office:"🏢", out:"📍" };

export default function Profile() {
  const { userProfile, updateProfile, context, setContext, behaviorLog, missionProgress } = useApp();

  const resetApp = () => {
    if (window.confirm("Reset all data and start fresh?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const setSimTime = (t) => setContext(c => ({ ...c, simulatedTime: t }));
  const setSimLoc = (l) => setContext(c => ({ ...c, location: l }));

  const realTime = getTimeOfDay();
  const activeTime = context.simulatedTime || realTime;

  return (
    <div className="page">
      <div className="page-header">
        <div className="greeting">👤 PROFILE</div>
        <h1>My Profile</h1>
        <p className="subtitle">Preferences & demo controls</p>
      </div>

      {/* User info */}
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
          <div style={{
            width:56, height:56, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--accent), var(--accent2))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.4rem', fontWeight:800, color:'#fff', flexShrink:0
          }}>{userProfile.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div style={{fontWeight:700, fontSize:'1.1rem'}}>{userProfile.name || "Guest"}</div>
            <div className="text-xs text-muted">Member since {userProfile.startDate ? new Date(userProfile.startDate).toLocaleDateString('en-IN') : "today"}</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <StatBox label="Meals Logged" val={behaviorLog.filter(b=>b.action==='chosen').length} emoji="🍽️" />
          <StatBox label="Day Streak" val={`🔥${missionProgress.currentStreak}`} emoji="" />
          <StatBox label="Diet Type" val={dietLabels[userProfile.dietType] || "—"} emoji="" />
          <StatBox label="Budget" val={`₹${userProfile.dailyBudget}/day`} emoji="" />
        </div>
      </div>

      {/* Goals */}
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:12}}>🎯 Your Goals</h3>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {(userProfile.goals || []).map(g => (
            <span key={g} className="badge badge-green">{goalLabels[g] || g}</span>
          ))}
          {(userProfile.goals || []).length === 0 && <span className="text-muted text-sm">No goals set</span>}
        </div>
      </div>

      {/* Allergies */}
      {(userProfile.allergies || []).length > 0 && (
        <div className="card" style={{marginBottom:16}}>
          <h3 style={{fontSize:'0.9rem', marginBottom:12}}>⚠️ Restrictions & Allergies</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
            {userProfile.allergies.map(a => (
              <span key={a} className="badge badge-red">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Context Simulator ── */}
      <div className="context-simulator">
        <div className="sim-label">🎮 Demo Context Simulator</div>
        <p style={{fontSize:'0.75rem', color:'var(--accent3)', marginBottom:12, lineHeight:1.5}}>
          Simulate different time & location scenarios to watch the AI re-rank recommendations in real time!
        </p>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:6, fontWeight:600}}>TIME OF DAY</div>
          <div className="sim-grid">
            {timeOptions.map(t => (
              <button key={t} className={`sim-btn ${activeTime === t ? "active" : ""}`}
                onClick={() => setSimTime(t === realTime && activeTime === t ? null : t)}>
                {timeEmoji[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === realTime && activeTime !== t && <span style={{fontSize:'0.6rem', display:'block', color:'var(--text-muted)'}}>← now</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:6, fontWeight:600}}>LOCATION</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {locationOptions.map(l => (
              <button key={l} className={`sim-btn ${context.location === l ? "active" : ""}`}
                onClick={() => setSimLoc(l)}>
                {locEmoji[l]} {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginTop:10, fontSize:'0.72rem', color:'rgba(168,85,247,0.7)'}}>
          Currently: {timeEmoji[activeTime]} {activeTime} · {locEmoji[context.location]} {context.location}
          {context.simulatedTime && <span style={{marginLeft:8, color:'var(--accent3)'}}>⚡ Simulated</span>}
        </div>
      </div>

      {/* Name edit */}
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:12}}>✏️ Edit Name</h3>
        <input
          className="input"
          placeholder="Your name"
          defaultValue={userProfile.name}
          onBlur={e => updateProfile({name: e.target.value})}
          style={{marginBottom:0}}
        />
      </div>

      {/* About / Architecture */}
      <div className="card" style={{marginBottom:16, borderColor:'rgba(34,197,94,0.15)'}}>
        <h3 style={{fontSize:'0.9rem', marginBottom:10}}>🧠 How the AI Works</h3>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {[
            {label:"Health Score", desc:"Nutri-Score, NOVA group, sugar & salt levels", color:"var(--accent)", weight:"40%"},
            {label:"Personal Fit", desc:"Diet type, allergies, goals, past behavior", color:"var(--accent3)", weight:"35%"},
            {label:"Context Fit", desc:"Time of day, location, day of week", color:"var(--accent2)", weight:"25%"},
          ].map(s => (
            <div key={s.label} style={{display:'flex', gap:12, alignItems:'flex-start',
              padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)'}}>
              <div style={{width:36, height:36, borderRadius:'var(--radius-sm)',
                background:`${s.color}22`, display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, color:s.color, fontSize:'0.75rem', flexShrink:0}}>{s.weight}</div>
              <div>
                <div style={{fontWeight:600, fontSize:'0.85rem', marginBottom:2}}>{s.label}</div>
                <div className="text-xs text-muted">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className="btn btn-outline flex" onClick={resetApp}
          style={{ flex: 1, color:'var(--accent-red)', borderColor:'rgba(239,68,68,0.2)' }}>
          🗑️ Reset Data
        </button>
        <button className="btn btn-outline flex" onClick={async () => {
            await signOut(auth);
            window.location.reload();
          }}
          style={{ flex: 1, color:'var(--text-muted)', borderColor:'var(--border)' }}>
          👋 Log Out
        </button>
      </div>

      <p className="text-xs text-muted text-center" style={{marginBottom:8}}>
        All data is stored locally on your device. No servers.
      </p>
      <p className="text-xs text-muted text-center">
        Built with Open Food Facts API · Evidence-based design
      </p>
    </div>
  );
}

function StatBox({ label, val, emoji }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.04)', borderRadius:'var(--radius-sm)',
      padding:'12px', textAlign:'center'
    }}>
      <div style={{fontWeight:800, fontSize:'1rem', marginBottom:2}}>{emoji}{val}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
