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
  padding: '10px 12px', 
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  background: 'rgba(8,12,20,0.92)',
  backdropFilter: 'blur(16px)',
  zIndex: 100
}}>

  {/* LOGO */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 6
  }}>
    <div style={{
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'linear-gradient(135deg, #2563eb, #0891b2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14
    }}>🎯</div>

    <span style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 15
    }}>
      MockMate
    </span>
  </div>

  {/* BUTTONS */}
  <div style={{
    display: 'flex',
    gap: 6
  }}>

    <button
      onClick={() => navigate('/login')}
      style={{
        background: 'transparent',
        color: 'var(--text)',
        border: '1px solid var(--border-light)',
        borderRadius: 6,
        padding: '5px 8px', 
        fontSize: 11,       
        cursor: 'pointer'
      }}
    >
      Sign In
    </button>

    <button
      onClick={() => navigate('/register')}
      style={{
        background: 'linear-gradient(135deg, #2563eb, #0891b2)',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '5px 10px', 
        fontSize: 11,
        cursor: 'pointer'
      }}
    >
      Get Started
    </button>

  </div>
</nav>

      {/* HERO */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(60px, 10vw, 100px) 5% 60px',
        position: 'relative',
        maxWidth: 1200,
        margin: '0 auto'
      }}>

        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 64px)',
          fontWeight: 800,
          marginBottom: 20,
          lineHeight: 1.2,
          letterSpacing: '-1.5px'
        }}>
          Ace Your Next Interview<br />
          <span className="gradient-text">with AI Coaching</span>
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'var(--text-dim)',
          maxWidth: 520,
          margin: '0 auto 32px',
          lineHeight: 1.7,
          padding: '0 10px'
        }}>
          Practice with AI-generated FAANG-level questions, get instant feedback, and track your progress until you land the job.
        </p>

        {/* CTA */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: 420,
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              flex: 1,
              minWidth: 160,
              background: 'linear-gradient(135deg, #2563eb, #0891b2)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 20px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer'
            }}>
            Start Free Practice
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              minWidth: 140,
              background: 'var(--bg-elevated)',
              color: 'var(--text)',
              border: '1px solid var(--border-light)',
              borderRadius: 12,
              padding: '14px 20px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer'
            }}>
            Sign In
          </button>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 20,
          marginTop: 56,
          maxWidth: 600,
          marginInline: 'auto'
        }}>
          {[['500+', 'Questions Generated'], ['8+', 'Job Roles'], ['Real-time', 'AI Feedback'], ['Adaptive', 'Difficulty']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 800,
                color: 'var(--accent)'
              }}>
                {val}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(50px, 8vw, 80px) 5%', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800 }}>
            Everything You Need to Get Hired
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 420, margin: '10px auto' }}>
            A complete mock interview platform built for serious candidates.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 18,
          maxWidth: 1100,
          margin: '0 auto'
        }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section style={{
        padding: 'clamp(50px, 8vw, 80px) 5%',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800 }}>
            Interviews for Every Role
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            From fresh graduates to Senior Engineers
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          maxWidth: 700,
          margin: '0 auto'
        }}>
          {roles.map(role => (
            <span key={role} className="tag" style={{ padding: '6px 14px', fontSize: 13 }}>
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800 }}>
          Ready to Crush Your Interview?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
          Start practicing now — it's completely free.
        </p>

        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #0891b2)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            padding: '16px 36px',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer'
          }}>
          Create Free Account
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '18px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span>🎯</span>
          <span style={{ fontWeight: 700 }}>MockMate</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          AI-powered interview preparation platform
        </p>
      </footer>

    </div>
  );
}
