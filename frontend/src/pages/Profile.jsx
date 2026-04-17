import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'HR'];
const LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', role: user?.role || 'SDE', experienceLevel: user?.experienceLevel || 'Fresher', skills: user?.skills?.join(', ') || '', resumeText: user?.resumeText || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await userAPI.updateProfile({ ...form, skills });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await userAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Manage your account and preferences</p>
      </div>

      {/* Avatar */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'white', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span className="tag">{user?.role}</span>
            <span className="tag-success tag">{user?.experienceLevel}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
        {[['profile', '👤 Profile'], ['password', '🔒 Password'], ['resume', '📋 Resume']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              background: tab === id ? 'var(--bg-elevated)' : 'transparent',
              color: tab === id ? 'var(--text)' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card animate-fade-in">
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Full Name</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Target Role</label>
              <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Experience Level</label>
              <select className="input-field" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Skills (comma-separated)</label>
            <input className="input-field" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, Node.js, Python, SQL..." />
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card animate-fade-in">
          {[['currentPassword', 'Current Password', 'Enter current password'], ['newPassword', 'New Password', 'Min. 6 characters'], ['confirm', 'Confirm New Password', 'Repeat new password']].map(([key, label, ph]) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>{label}</label>
              <input type="password" className="input-field" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
            </div>
          ))}
          <button onClick={handlePassword} className="btn-primary" disabled={pwLoading} style={{ marginTop: 6 }}>
            {pwLoading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      )}

      {tab === 'resume' && (
        <div className="card animate-fade-in">
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Add your resume text to get personalized interview questions based on your background and experience.
          </p>
          <textarea className="input-field" style={{ minHeight: 240 }} value={form.resumeText} onChange={e => set('resumeText', e.target.value)}
            placeholder="Paste your resume text here...&#10;&#10;Include: work experience, projects, education, skills, achievements" />
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{user?.totalInterviews || 0}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Total Interviews</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: user?.averageScore >= 7 ? 'var(--success)' : user?.averageScore >= 4 ? 'var(--accent)' : 'var(--warning)' }}>
            {user?.averageScore || 0}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/10</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Average Score</div>
        </div>
      </div>
    </div>
  );
}
