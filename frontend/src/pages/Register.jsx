import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'HR'];
const LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SDE', experienceLevel: 'Fresher' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to MockMate 🎯');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Start your AI-powered interview journey</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Full Name</label>
            <input type="text" className="input-field" placeholder="Alex Johnson" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Password</label>
            <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Target Role</label>
              <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Experience</label>
              <select className="input-field" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }} disabled={loading}>
            {loading
              ? <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} /> Creating account...</>
              : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
