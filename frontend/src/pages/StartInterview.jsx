import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';

const ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'HR'];
const TYPES = [
  { id: 'mixed', label: 'Mixed', icon: '🎯', desc: 'Combination of technical & behavioral questions' },
  { id: 'technical', label: 'Technical', icon: '💻', desc: 'DSA, system design, coding concepts' },
  { id: 'behavioral', label: 'Behavioral', icon: '🗣', desc: 'STAR method, leadership, teamwork' },
  { id: 'system-design', label: 'System Design', icon: '🏗', desc: 'Architecture, scalability, databases' },
  { id: 'hr', label: 'HR Round', icon: '👔', desc: 'Culture fit, goals, salary discussion' },
];
const LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

export default function StartInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    role: user?.role || 'SDE',
    interviewType: 'mixed',
    experienceLevel: user?.experienceLevel || 'Fresher',
    resumeText: '',
    adaptiveDifficulty: true,
  });
  const [loading, setLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }));

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.start(config);
      toast.success('Interview session started!');
      navigate(`/interview/${res.data.sessionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Configure Your Interview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Customize your mock interview session</p>
      </div>

      {/* Role */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Target Role</h3>
        <select className="input-field" value={config.role} onChange={e => set('role', e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Type */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Interview Type</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TYPES.map(({ id, label, icon, desc }) => (
            <div key={id}
              onClick={() => set('interviewType', id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                background: config.interviewType === id ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                border: `1px solid ${config.interviewType === id ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
              }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${config.interviewType === id ? 'var(--accent)' : 'var(--border-light)'}`, background: config.interviewType === id ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {config.interviewType === id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Experience Level</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => set('experienceLevel', l)}
              style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${config.experienceLevel === l ? 'var(--accent)' : 'var(--border)'}`, background: config.experienceLevel === l ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)', color: config.experienceLevel === l ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Adaptive */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🤖 Adaptive Difficulty</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI adjusts question difficulty based on your answers</p>
          </div>
          <div onClick={() => set('adaptiveDifficulty', !config.adaptiveDifficulty)}
            style={{ width: 46, height: 26, borderRadius: 99, background: config.adaptiveDifficulty ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${config.adaptiveDifficulty ? 'var(--accent)' : 'var(--border-light)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'white', top: 2, left: config.adaptiveDifficulty ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showResume ? 16 : 0 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📋 Resume-Based Questions</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Paste your resume for personalized questions</p>
          </div>
          <button onClick={() => setShowResume(!showResume)} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 12 }}>
            {showResume ? 'Hide' : 'Add Resume'}
          </button>
        </div>
        {showResume && (
          <textarea className="input-field" style={{ minHeight: 140 }}
            placeholder="Paste your resume text here... (skills, experience, projects)"
            value={config.resumeText}
            onChange={e => set('resumeText', e.target.value)}
          />
        )}
      </div>

      {/* Start */}
      <button onClick={handleStart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px' }} disabled={loading}>
        {loading
          ? <><span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} /> Starting Interview...</>
          : '🚀 Start Interview'}
      </button>
    </div>
  );
}
