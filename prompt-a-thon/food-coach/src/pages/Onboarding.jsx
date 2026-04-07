import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const dietOptions = [
  { key: "omnivore", emoji: "🍗", name: "Omnivore", desc: "Eat everything" },
  { key: "vegetarian", emoji: "🥗", name: "Vegetarian", desc: "No meat/fish" },
  { key: "vegan", emoji: "🌱", name: "Vegan", desc: "100% plant-based" },
  { key: "keto", emoji: "🥩", name: "Keto", desc: "Low carb, high fat" },
];

const goalOptions = [
  { key: "weight-loss", emoji: "⚖️", label: "Weight Loss" },
  { key: "energy", emoji: "⚡", label: "More Energy" },
  { key: "muscle", emoji: "💪", label: "Build Muscle" },
  { key: "gut-health", emoji: "🧬", label: "Gut Health" },
];

const allergyOptions = ["Gluten", "Dairy", "Nuts", "Eggs", "Soy", "Shellfish", "None"];

const budgetOptions = [
  { key: 100, label: "Under ₹100/day", emoji: "🪙" },
  { key: 200, label: "₹100–200/day", emoji: "💵" },
  { key: 400, label: "₹200–400/day", emoji: "💰" },
  { key: 600, label: "₹400+/day", emoji: "💎" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    dietType: "",
    goals: [],
    allergies: [],
    dailyBudget: 200,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleGoal = (g) => {
    setForm(f => ({
      ...f, goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g]
    }));
  };

  const toggleAllergy = (a) => {
    if (a === "None") { setForm(f => ({ ...f, allergies: [] })); return; }
    setForm(f => ({
      ...f, allergies: f.allergies.includes(a) ? f.allergies.filter(x => x !== a) : [...f.allergies, a]
    }));
  };

  const finish = () => {
    updateProfile({ ...form, onboarded: true, startDate: new Date().toISOString() });
    navigate("/");
  };

  const steps = [
    <StepName key="name" form={form} setForm={setForm} next={nextStep} />,
    <StepDiet key="diet" form={form} setForm={setForm} next={nextStep} prev={prevStep} />,
    <StepGoals key="goals" form={form} toggleGoal={toggleGoal} next={nextStep} prev={prevStep} />,
    <StepConstraints key="constraints" form={form} setForm={setForm} toggleAllergy={toggleAllergy} finish={finish} prev={prevStep} />,
  ];

  return (
    <div className="onboard-page">
      {/* Step dots */}
      <div className="onboard-steps">
        {[0,1,2,3].map(i => (
          <div key={i} className={`onboard-step-dot ${i < step ? "done" : ""} ${i === step ? "active" : ""}`} />
        ))}
      </div>
      {steps[step]}
    </div>
  );
}

function StepName({ form, setForm, next }) {
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
      <div className="onboard-emoji">👋</div>
      <div className="onboard-title">Welcome to FoodCoach</div>
      <div className="onboard-subtitle">
        Your personal habit-aware nutrition companion. Let's set up your profile in 60 seconds.
      </div>
      <label style={{fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em'}}>Your Name</label>
      <input
        className="input"
        placeholder="e.g. Rahul, Priya..."
        value={form.name}
        onChange={e => setForm(f => ({...f, name: e.target.value}))}
        style={{marginBottom: 24}}
      />
      <button className="btn btn-primary btn-lg btn-full" onClick={next} disabled={!form.name.trim()}>
        Get Started →
      </button>
      <p className="text-xs text-muted text-center mt-3">No account needed · Data stays on your device</p>
    </div>
  );
}

function StepDiet({ form, setForm, next, prev }) {
  return (
    <div style={{flex:1}}>
      <div className="onboard-emoji">🍽️</div>
      <div className="onboard-title">Your Eating Style</div>
      <div className="onboard-subtitle">This helps us filter meals that actually work for you.</div>
      <div className="option-grid">
        {dietOptions.map(d => (
          <div key={d.key} className={`option-card ${form.dietType === d.key ? "selected" : ""}`}
            onClick={() => setForm(f => ({...f, dietType: d.key}))}>
            <div className="opt-emoji">{d.emoji}</div>
            <div className="opt-name">{d.name}</div>
            <div className="opt-desc">{d.desc}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex', gap:12}}>
        <button className="btn btn-ghost" onClick={prev}>← Back</button>
        <button className="btn btn-primary btn-full" onClick={next} disabled={!form.dietType}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepGoals({ form, toggleGoal, next, prev }) {
  return (
    <div style={{flex:1}}>
      <div className="onboard-emoji">🎯</div>
      <div className="onboard-title">Your Health Goals</div>
      <div className="onboard-subtitle">Pick one or more. We'll tailor your recommendations and missions around these.</div>
      <div className="option-grid" style={{marginBottom:24}}>
        {goalOptions.map(g => (
          <div key={g.key} className={`option-card ${form.goals.includes(g.key) ? "selected" : ""}`}
            onClick={() => toggleGoal(g.key)}>
            <div className="opt-emoji">{g.emoji}</div>
            <div className="opt-name" style={{fontSize:'0.82rem'}}>{g.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex', gap:12}}>
        <button className="btn btn-ghost" onClick={prev}>← Back</button>
        <button className="btn btn-primary btn-full" onClick={next} disabled={form.goals.length === 0}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepConstraints({ form, setForm, toggleAllergy, finish, prev }) {
  return (
    <div style={{flex:1}}>
      <div className="onboard-emoji">⚙️</div>
      <div className="onboard-title">Constraints & Allergies</div>
      <div className="onboard-subtitle">Help us avoid anything that doesn't work for you.</div>

      <label style={{fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:10, display:'block', textTransform:'uppercase', letterSpacing:'0.06em'}}>Allergies & Dietary Restrictions</label>
      <div className="chips-grid">
        {allergyOptions.map(a => (
          <div key={a} className={`tag-chip ${form.allergies.includes(a) || (a === "None" && form.allergies.length === 0) ? "selected" : ""}`}
            onClick={() => toggleAllergy(a)}>
            {a}
          </div>
        ))}
      </div>

      <label style={{fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', margin:'20px 0 10px', display:'block', textTransform:'uppercase', letterSpacing:'0.06em'}}>Daily Food Budget</label>
      <div className="option-grid">
        {budgetOptions.map(b => (
          <div key={b.key} className={`option-card ${form.dailyBudget === b.key ? "selected" : ""}`}
            style={{padding:'12px 8px'}}
            onClick={() => setForm(f => ({...f, dailyBudget: b.key}))}>
            <div className="opt-emoji" style={{fontSize:'1.2rem', marginBottom:4}}>{b.emoji}</div>
            <div className="opt-name" style={{fontSize:'0.75rem'}}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', gap:12, marginTop:8}}>
        <button className="btn btn-ghost" onClick={prev}>← Back</button>
        <button className="btn btn-primary btn-full" onClick={finish}>
          🚀 Start Coaching!
        </button>
      </div>
    </div>
  );
}
