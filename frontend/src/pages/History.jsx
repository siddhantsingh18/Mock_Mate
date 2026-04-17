import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';

const scoreColor = (s) => s >= 8 ? 'var(--success)' : s >= 5 ? 'var(--accent)' : s >= 3 ? 'var(--warning)' : 'var(--danger)';
const typeIcon = (t) => ({ behavioral: '🗣', 'system-design': '🏗', hr: '👔', technical: '💻', mixed: '🎯' })[t] || '🎯';

export default function History() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    interviewAPI.getHistory({ page, limit: 10 })
      .then(res => {
        setInterviews(res.data.interviews || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = filter === 'all' ? interviews : interviews.filter(i => i.interviewType === filter);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Interview History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Review all your past mock interviews</p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'mixed', 'technical', 'behavioral', 'system-design', 'hr'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, background: filter === f ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)', color: filter === f ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>No interviews found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Start practicing to see your history here.</p>
          <button onClick={() => navigate('/start')} className="btn-primary">Start Interview →</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(iv => (
              <div key={iv._id} className="card card-hover" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
                onClick={() => navigate(`/report/${iv.sessionId}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {typeIcon(iv.interviewType)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{iv.role}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{iv.interviewType}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-light)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{iv.answeredQuestions} questions</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-light)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{iv.duration}m</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: scoreColor(iv.overallScore) }}>
                      {iv.overallScore}<span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(iv.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 14, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
