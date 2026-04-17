import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, analyticsAPI } from '../services/api';

function StatCard({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      interviewAPI.getHistory({ page: 1, limit: 5 }).catch(() => ({ data: { interviews: [] } })),
      analyticsAPI.getDashboard().catch(() => ({ data: null }))
    ]).then(([h, a]) => {
      setHistory(h.data.interviews || []);
      setAnalytics(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const scoreColor = (s) => s >= 8 ? 'var(--success)' : s >= 5 ? 'var(--accent)' : s >= 3 ? 'var(--warning)' : 'var(--danger)';
  const trendIcon = analytics?.recentTrend === 'improving' ? '📈' : analytics?.recentTrend === 'declining' ? '📉' : '➡️';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>
          {analytics?.totalInterviews > 0
            ? `You've completed ${analytics.totalInterviews} interview${analytics.totalInterviews > 1 ? 's' : ''}. ${trendIcon} Performance is ${analytics.recentTrend}.`
            : "Ready to start your first mock interview? Let's go!"}
        </p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(8,145,178,0.15))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Start a New Interview</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>AI-powered questions for {user?.role} — {user?.experienceLevel} level</p>
        </div>
        <button onClick={() => navigate('/start')} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px', whiteSpace: 'nowrap' }}>
          Start Interview →
        </button>
      </div>

      {/* Stats */}
      {!loading && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Interviews" value={analytics.totalInterviews} />
          <StatCard label="Average Score" value={analytics.averageScore > 0 ? `${analytics.averageScore}/10` : '—'} color={analytics.averageScore > 0 ? scoreColor(analytics.averageScore) : 'var(--text-muted)'} />
          <StatCard label="Best Score" value={analytics.bestScore > 0 ? `${analytics.bestScore}/10` : '—'} color="var(--success)" />
          <StatCard label="Time Practiced" value={analytics.totalTimeSpent > 0 ? `${analytics.totalTimeSpent}m` : '—'} color="var(--accent-secondary)" />
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
      )}

      {/* Recent interviews */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Recent Interviews</h2>
          {history.length > 0 && <button onClick={() => navigate('/history')} className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }}>View All</button>}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>No interviews yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Start your first mock interview to see your results here.</p>
            <button onClick={() => navigate('/start')} className="btn-primary">Start First Interview →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(iv => (
              <div key={iv._id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, cursor: 'pointer' }}
                onClick={() => navigate(`/report/${iv.sessionId}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(8,145,178,0.2))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {iv.interviewType === 'behavioral' ? '🗣' : iv.interviewType === 'system-design' ? '🏗' : iv.interviewType === 'hr' ? '👔' : '💻'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>{iv.role}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{iv.interviewType} • {iv.answeredQuestions} questions • {iv.duration}m</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: scoreColor(iv.overallScore) }}>{iv.overallScore}<span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/10</span></div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(iv.completedAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weak topics */}
      {!loading && analytics?.weakTopics?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Topics to Improve</h2>
          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {analytics.weakTopics.map(({ topic, count }) => (
                <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '7px 14px' }}>
                  <span style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 600 }}>{topic}</span>
                  <span style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 11, borderRadius: 4, padding: '1px 6px' }}>{count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
