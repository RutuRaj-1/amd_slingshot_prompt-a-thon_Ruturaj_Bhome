import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your Food Coach AI. Ask me about recipes, nutrition, or your daily diet!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Create chat context from history
      const contents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }]
      }));
      contents.push({ role: "user", parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are Food Coach AI, an expert nutrition and habit-building assistant. Keep your responses concise (max 3 sentences) unless asked for recipes or detail. Use emojis and a friendly tone. Suggest small, sustainable habits.",
        }
      });
      
      setMessages(prev => [...prev, { role: "assistant", text: response.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", text: "Oops! I ran into a bit of trouble connecting to my brain. Could you ask that again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary" 
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 999
        }}
        onClick={() => setIsOpen(true)}
        title="Food Coach AI"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          width: 'calc(100vw - 40px)',
          maxWidth: 380,
          height: '60vh',
          maxHeight: 600,
          backgroundColor: 'var(--bg-card)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🥗</span> Coach AI
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '8px 14px',
                borderRadius: 16,
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                maxWidth: '85%',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--bg-surface)',
                padding: '8px 14px',
                borderRadius: 16,
                borderBottomLeftRadius: 4,
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
              }}>
                Coach is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
            backgroundColor: 'var(--bg-surface)'
          }}>
            <input
              type="text"
              className="input"
              style={{ flex: 1, marginBottom: 0 }}
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0 12px' }}
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
