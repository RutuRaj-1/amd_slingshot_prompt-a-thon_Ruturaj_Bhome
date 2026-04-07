import { useState, useEffect } from "react";
import { app, auth, googleProvider } from "../../src/firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { useApp } from "../context/AppContext";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone auth specifics
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useApp();

  // Initialize Recaptcha dynamically
  useEffect(() => {
    if (mode === "phone" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  }, [mode]);

  const handleGoogle = async () => {
    setError("");
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      updateProfile({ name: res.user.displayName });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setError("");
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setError("");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      setError("Invalid OTP. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="onboard-page" style={{ justifyContent: "center" }}>
      <div className="card" style={{ padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🥗</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem" }}>Food Coach</h1>
          <p className="text-secondary text-sm">Your habit-aware nutrition companion</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--accent-red)", padding: 12, borderRadius: 8, color: "var(--accent-red)", fontSize: "0.85rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <button className="btn btn-outline btn-full" onClick={handleGoogle} disabled={loading} style={{ marginBottom: 24 }}>
          {loading && mode === "login" ? "..." : "Continue with Google"}
        </button>

        <div className="divider" style={{ position: "relative", textAlign: "center" }}>
          <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--bg-card)", padding: "0 10px", fontSize: "0.8rem", color: "var(--text-muted)" }}>OR</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className={`btn btn-sm flex`} style={{ flex: 1, background: mode === "login" ? "var(--bg-surface)" : "transparent", border: mode === "login" ? "1px solid var(--border)" : "none", color: mode === "login" ? "var(--text-primary)" : "var(--text-muted)" }} onClick={() => setMode("login")}>Email</button>
          <button className={`btn btn-sm flex`} style={{ flex: 1, background: mode === "signup" ? "var(--bg-surface)" : "transparent", border: mode === "signup" ? "1px solid var(--border)" : "none", color: mode === "signup" ? "var(--text-primary)" : "var(--text-muted)" }} onClick={() => setMode("signup")}>Sign Up</button>
          <button className={`btn btn-sm flex`} style={{ flex: 1, background: mode === "phone" ? "var(--bg-surface)" : "transparent", border: mode === "phone" ? "1px solid var(--border)" : "none", color: mode === "phone" ? "var(--text-primary)" : "var(--text-muted)" }} onClick={() => setMode("phone")}>Phone</button>
        </div>

        {(mode === "login" || mode === "signup") && (
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
        )}

        {mode === "phone" && (
          <div>
            {!confirmationResult ? (
              <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input" type="tel" placeholder="+91 9999999999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                <div id="recaptcha-container"></div>
                <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input" type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required />
                <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
                  Verify OTP
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
