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
{/* NAVBAR */}
<nav style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 5%',
  minHeight: 64,
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  background: 'rgba(8,12,20,0.92)',
  backdropFilter: 'blur(16px)',
  zIndex: 100,
  flexWrap: 'wrap'
}}>

  {/* LOGO */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0
  }}>
    <div style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      background: 'linear-gradient(135deg, #2563eb, #0891b2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16
    }}>🎯</div>

    <span style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 16
    }}>
      MockMate
    </span>
  </div>

  {/* BUTTONS */}
  <div style={{
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap', 
    justifyContent: 'flex-end'
  }}>
    
    <button
      onClick={() => navigate('/login')}
      style={{
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
        border: '1px solid var(--border-light)',
        borderRadius: 6,
        padding: '6px 10px', 
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '12px', 
        cursor: 'pointer'
      }}>
      Sign In
    </button>

    <button
      onClick={() => navigate('/register')}
      style={{
        background: 'linear-gradient(135deg, #2563eb, #0891b2)',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '6px 10px', 
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '12px', 
        cursor: 'pointer'
      }}>
      Get Started
    </button>

  </div>
</nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: 'clamp(56px, 10vw, 100px) 5% 60px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="animate-fade-in">
        
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 72px)', fontWeight: 800, marginBottom: 18, lineHeight: 1.1, letterSpacing: '-2px' }}>
            Ace Your Next Interview<br />
            <span className="gradient-text">with AI Coaching</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-dim)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7, padding: '0 8px' }}>
            Practice with AI-generated FAANG-level questions, get instant feedback, and track your progress until you land the job.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 26px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Start Free Practice 
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 26px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Sign In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 52px)', marginTop: 56, flexWrap: 'wrap', padding: '0 16px' }}>
          {[['500+', 'Questions Generated'], ['8+', 'Job Roles'], ['Real-time', 'AI Feedback'], ['Adaptive', 'Difficulty']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: 'var(--accent)' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(40px, 7vw, 80px) 5%', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Everything You Need to Get Hired</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 420, margin: '0 auto' }}>A complete mock interview platform built for serious candidates.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 7 }}>{title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section style={{ padding: 'clamp(40px, 7vw, 80px) 5%', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Interviews for Every Role</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>From fresh graduates to Senior Engineers</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', maxWidth: 660, margin: '0 auto' }}>
          {roles.map(role => <span key={role} className="tag" style={{ padding: '6px 14px', fontSize: 13 }}>{role}</span>)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(56px, 10vw, 100px) 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14 }}>Ready to Crush Your Interview?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>Start practicing now — it's completely free.</p>
        <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 34px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Create Free Account 
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '18px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>MockMate</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>AI-powered interview preparation platform</p>
      
      </footer>
    </div>
  );
}
