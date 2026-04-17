import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🤖', title: 'AI-Generated Questions', desc: 'Dynamic questions powered by Groq LLaMA, tailored to your role and experience level.' },
  { icon: '📊', title: 'Instant AI Feedback', desc: 'Get scored 0–10 with strengths, weaknesses, and a model answer after every response.' },
  { icon: '🎯', title: 'Adaptive Difficulty', desc: 'Questions get harder or easier based on your performance — just like real interviewers.' },
  { icon: '🗣', title: 'Voice & Text Input', desc: 'Answer via text or use your microphone with Web Speech API transcription.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Track your progress over time, spot weak topics, and measure improvement.' },
  { icon: '📋', title: 'Resume-Based Questions', desc: 'Upload your resume and get personalized questions based on your experience.' },
];

const roles = ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Product Manager'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 5%', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(8,12,20,0.9)', backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>MockMate</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '9px 20px' }}>Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '9px 20px' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 5% 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="animate-fade-in">
         
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: '-2px' }}>
            Ace Your Next Interview<br />
            <span className="gradient-text">with AI Coaching</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-dim)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Practice with AI-generated FAANG-level questions, get instant feedback, and track your progress until you land the job.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Start Free Practice →
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Sign In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 72, flexWrap: 'wrap' }}>
          {[['500+', 'Questions Generated'], ['8+', 'Job Roles'], ['Real-time', 'AI Feedback'], ['Adaptive', 'Difficulty']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 5%', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
            Everything You Need to Get Hired
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            A complete mock interview platform built for serious candidates.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card card-hover" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '80px 5%', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Interviews for Every Role</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>From fresh graduates to senior engineers</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
          {roles.map(role => (
            <span key={role} className="tag" style={{ padding: '8px 18px', fontSize: 14 }}>{role}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Ready to Crush Your Interview?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 40 }}>Start practicing now — it's completely free.</p>
        <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 17, padding: '16px 40px' }}>
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>MockMate</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>AI-powered interview preparation platform</p>
      </footer>
    </div>
  );
}
