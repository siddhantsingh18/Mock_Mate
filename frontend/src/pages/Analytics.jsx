import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { analyticsAPI } from '../services/api';

const scoreColor = (s) => s >= 8 ? '#10b981' : s >= 5 ? '#3b82f6' : s >= 3 ? '#f59e0b' : '#ef4444';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{new Date(label).toLocaleDateString()}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: scoreColor(payload[0]?.value) }}>{payload[0]?.value}/10</div>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
    </div>
  );

  if (!data || data.totalInterviews === 0) return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 28 }}>Analytics</h1>
      <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>No data yet</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Complete at least one interview to see your analytics.</p>
        <button onClick={() => navigate('/start')} className="btn-primary">Start Interview →</button>
      </div>
    </div>
  );

  const progressData = data.progressData.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() }));

  const radarData = [
    { subject: 'Technical', value: data.averageTechnical * 10 },
    { subject: 'Communication', value: data.averageCommunication * 10 },
    { subject: 'Consistency', value: Math.min(100, data.totalInterviews * 10) },
    { subject: 'Avg Score', value: data.averageScore * 10 },
    { subject: 'Best Score', value: data.bestScore * 10 },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Track your performance over time</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Interviews', value: data.totalInterviews, color: 'var(--accent)' },
          { label: 'Avg Score', value: `${data.averageScore}/10`, color: scoreColor(data.averageScore) },
          { label: 'Best Score', value: `${data.bestScore}/10`, color: 'var(--success)' },
          { label: 'Time Practiced', value: `${data.totalTimeSpent}m`, color: 'var(--accent-secondary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      {progressData.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            Score Progress
            <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 400, color: data.recentTrend === 'improving' ? 'var(--success)' : data.recentTrend === 'declining' ? 'var(--danger)' : 'var(--text-muted)' }}>
              {data.recentTrend === 'improving' ? '📈 Improving' : data.recentTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6, fill: 'var(--accent-secondary)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Radar chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Performance Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Radar name="Performance" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Role breakdown */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>By Role</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(data.roleBreakdown || {}).map(([role, { count, avgScore }]) => (
              <div key={role}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{role}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} interviews</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: scoreColor(avgScore) }}>{avgScore}/10</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${avgScore * 10}%`, background: `linear-gradient(90deg, ${scoreColor(avgScore)}, ${scoreColor(avgScore)}aa)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak topics */}
      {data.weakTopics?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚠️ Topics to Focus On</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {data.weakTopics.map(({ topic, count }) => (
              <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '7px 14px' }}>
                <span style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 600 }}>{topic}</span>
                <span style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 11, borderRadius: 4, padding: '1px 6px' }}>{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {data.topStrengths?.length > 0 && (
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>✅ Top Strengths</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {data.topStrengths.map(({ strength, count }) => (
              <div key={strength} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '7px 14px' }}>
                <span style={{ color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>{strength}</span>
                <span style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 11, borderRadius: 4, padding: '1px 6px' }}>{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
