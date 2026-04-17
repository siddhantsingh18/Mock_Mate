import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';

const scoreColor = (s) => s >= 8 ? 'var(--success)' : s >= 5 ? 'var(--accent)' : s >= 3 ? 'var(--warning)' : 'var(--danger)';
const scoreLabel = (s) => s >= 8 ? 'Excellent' : s >= 6 ? 'Good' : s >= 4 ? 'Average' : 'Needs Work';

function ScoreRing({ score, size = 100 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct = (score / 10) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={circ - pct}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.26, fontWeight: 800, color: scoreColor(score), lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)' }}>/ 10</span>
      </div>
    </div>
  );
}

export default function InterviewReport() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    interviewAPI.getSession(sessionId)
      .then(res => setData(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  if (!data) return null;

  const tabs = ['overview', 'questions', 'tips'];

  const hiringColor = { 'Strong Yes': 'var(--success)', 'Yes': '#34d399', 'Maybe': 'var(--warning)', 'No': 'var(--danger)', 'Strong No': '#dc2626' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>← Back</button>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Interview Report</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{data.role} • {data.interviewType} • {data.answeredQuestions} questions • {data.duration} min</p>
      </div>

      {/* Score overview */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(13,20,32,1), rgba(17,25,39,1))', borderColor: 'rgba(59,130,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <ScoreRing score={data.overallScore} size={110} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              Overall: <span style={{ color: scoreColor(data.overallScore) }}>{scoreLabel(data.overallScore)}</span>
            </div>
            {data.improvementTips?.[0] && <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>{data.improvementTips[0]}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {[['Communication', data.communicationRating], ['Technical', data.technicalDepth]].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: scoreColor(val) }}>{val}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/10</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
              background: activeTab === t ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === t ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
            {t === 'overview' ? '📊 Overview' : t === 'questions' ? '❓ Questions' : '💡 Tips'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {data.strengths?.length > 0 && (
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 12 }}>✅ Strengths</div>
                {data.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)}
              </div>
            )}
            {data.weakTopics?.length > 0 && (
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--warning)', marginBottom: 12 }}>📌 Weak Topics</div>
                {data.weakTopics.map((t, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 }}>• {t}</div>)}
              </div>
            )}
          </div>

          {/* Per-question scores */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Question Scores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.answers?.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', minWidth: 24 }}>Q{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>{a.question?.substring(0, 70)}...</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(a.feedback?.score || 0) * 10}%`, background: `linear-gradient(90deg, ${scoreColor(a.feedback?.score || 0)}, ${scoreColor(a.feedback?.score || 0)}aa)` }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: scoreColor(a.feedback?.score || 0), minWidth: 36, textAlign: 'right' }}>{a.feedback?.score || 0}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.answers?.map((a, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)' }}>Q{i + 1}</span>
                    <span className="tag" style={{ fontSize: 11, textTransform: 'capitalize' }}>{a.questionType}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.difficulty}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>{a.question}</p>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: scoreColor(a.feedback?.score || 0), flexShrink: 0 }}>{a.feedback?.score || 0}/10</div>
              </div>
              {a.answer && (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Your Answer</div>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{a.answer}</p>
                </div>
              )}
              {a.feedback?.suggestedAnswer && (
                <details>
                  <summary style={{ fontSize: 13, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>💡 View model answer</summary>
                  <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7 }}>{a.feedback.suggestedAnswer}</p>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💡 Improvement Tips</div>
            {data.improvementTips?.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</div>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, paddingTop: 2 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/start')} className="btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}>Practice Again →</button>
        <button onClick={() => navigate('/analytics')} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}>📈 View Analytics</button>
      </div>
    </div>
  );
}
