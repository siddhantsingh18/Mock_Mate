import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { interviewAPI } from '../services/api';

const TOTAL_QUESTIONS = 10;

function Timer({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const pct = Math.max(0, (seconds / 120) * 100);
  const color = seconds < 20 ? 'var(--danger)' : seconds < 60 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
        <svg width="32" height="32" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color, minWidth: 48 }}>
        {m}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading'); 
  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [timer, setTimer] = useState(120);
  const [inputMode, setInputMode] = useState('text');
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Check voice support on mount
  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const fetchQuestion = useCallback(async () => {
    setPhase('loading');
    setAnswer('');
    setFeedback(null);
    setFollowUps([]);
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    try {
      const res = await interviewAPI.getQuestion(sessionId, {});
      setQuestionData(res.data);
      setQuestionNum(res.data.questionNumber);
      setTimer(res.data.timeLimit || 120);
      startTimeRef.current = Date.now();
      setPhase('answering');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch question');
      navigate('/dashboard');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    interviewAPI.getSession(sessionId)
      .then(res => setSessionInfo(res.data))
      .catch(() => {});
    fetchQuestion();
    // Cleanup on unmount
    return () => {
      clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'answering') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Voice input ──────────────────────────────────────────────
  const startVoice = () => {
    if (!voiceSupported) {
      toast.error('Voice not supported. Use Chrome or Edge.');
      return;
    }
    // Stop any existing session first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();

    const isMobile =/Android|iPhone|iPad/i.test(navigator.userAgent)
    recognition.continuous = !isMobile;
    recognition.interimResults = true;
    recognition.lang = 'en-UK';
    recognition.maxAlternatives = 1;

    // Keep a running final transcript separately from React state
    finalTranscriptRef.current = answer; 

    recognition.onstart = () => {
      setIsRecording(true);
      setInputMode('voice');
      toast.success('🎤 Listening... speak now');
    };

    recognition.onresult = (e) => {
      let interim = '';
      let newFinal = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          newFinal += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (newFinal) {
        finalTranscriptRef.current += newFinal;
        setAnswer(finalTranscriptRef.current);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsRecording(false);
      setInterimTranscript('');
      if (e.error === 'not-allowed') {
        toast.error('Microphone permission denied. Please allow mic access.');
      } else if (e.error === 'no-speech') {
        toast.error('No speech detected. Try again.');
      } else {
        toast.error(`Voice error: ${e.error}`);
      }
    };

   recognition.onend = () => {
    setIsRecording(false)
    if (finalTranscriptRef.current) {
      setAnswer(finalTranscriptRef.current.trim())
    }

  if (isMobile && isRecording) {
    try {
      recognition.start(); 
    } catch {}
  }
};

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      toast.error('Could not start microphone. Try again.');
      setIsRecording(false);
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  };


  const submitAnswer = async () => {
    const finalAnswer = answer.trim();
    if (!finalAnswer) {
      toast.error('Please provide an answer before submitting');
      return;
    }
    if (isRecording) stopVoice();
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeSpent = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    try {
      const res = await interviewAPI.submitAnswer(sessionId, {
        questionId: questionData.questionId,
        question: questionData.question,
        questionType: questionData.questionType,
        difficulty: questionData.difficulty,
        answer: finalAnswer,
        inputMode,
        timeSpent,
        expectedKeyPoints: questionData.expectedKeyPoints || [],
      });
      setFeedback(res.data.feedback);
      setFollowUps(res.data.followUpQuestions || []);
      setPhase('feedback');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // End interview early 
  const finishInterview = async () => {
    setFinishing(true);
    setShowEndConfirm(false);
    setPhase('loading');
    try {
      await interviewAPI.complete(sessionId);
      toast.success('Interview completed! 🎉');
      navigate(`/report/${sessionId}`);
    } catch (err) {
      toast.error('Failed to complete interview');
      navigate('/dashboard');
    } finally {
      setFinishing(false);
    }
  };

  const handleNext = () => {
    if (questionNum >= TOTAL_QUESTIONS) {
      finishInterview();
    } else {
      fetchQuestion();
    }
  };

  const scoreColor = (s) => s >= 8 ? 'var(--success)' : s >= 5 ? 'var(--accent)' : s >= 3 ? 'var(--warning)' : 'var(--danger)';
  const diffColor = { easy: 'var(--success)', medium: 'var(--warning)', hard: 'var(--danger)' };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {finishing ? 'Generating your report...' : 'AI is preparing your question...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* End Early Confirm Modal */}
      {showEndConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-fade-in" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🏁</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>End Interview?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              You've answered <strong style={{ color: 'var(--text)' }}>{questionNum} question{questionNum !== 1 ? 's' : ''}</strong> so far.
              Your report will be generated based on what you've completed.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowEndConfirm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Continue Interview
              </button>
              <button onClick={finishInterview} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
                Yes, Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🎯</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>MockMate — Live Interview</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sessionInfo?.role || 'Interview'} • {sessionInfo?.interviewType || ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Q {questionNum}/{TOTAL_QUESTIONS}</span>
            <div style={{ width: 90, height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))', width: `${(questionNum / TOTAL_QUESTIONS) * 100}%`, transition: 'width 0.4s' }} />
            </div>
          </div>

          {phase === 'answering' && <Timer seconds={timer} />}

          {/* End Early button — visible after at least 1 answered question */}
          {questionNum >= 1 && phase === 'feedback' && (
            <button
              onClick={() => setShowEndConfirm(true)}
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: 'var(--success)', cursor: 'pointer', padding: '6px 14px', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              🏁 Finish Early
            </button>
          )}

          <button
            onClick={() => { if (window.confirm('Quit interview? All progress will be lost.')) navigate('/dashboard'); }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}>
            Quit
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 5%', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {/* Question card */}
        <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>Question {questionNum}</span>
            <span className="tag" style={{ fontSize: 11, textTransform: 'capitalize' }}>{questionData?.questionType}</span>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, fontWeight: 600, background: `${diffColor[questionData?.difficulty]}20`, color: diffColor[questionData?.difficulty], border: `1px solid ${diffColor[questionData?.difficulty]}40`, textTransform: 'capitalize' }}>
              {questionData?.difficulty}
            </span>
            {sessionInfo?.adaptiveDifficulty && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🤖 Adaptive</span>}
          </div>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', lineHeight: 1.7, fontWeight: 500, color: 'var(--text)' }}>
            {questionData?.question}
          </p>

          {questionData?.hints?.length > 0 && phase === 'answering' && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>💡 Show hints</summary>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {questionData.hints.map((h, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px' }}>• {h}</div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Answer area */}
        {phase === 'answering' && (
          <div className="animate-fade-in">

            {/* Input mode toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => { if (isRecording) stopVoice(); setInputMode('text'); }}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${inputMode === 'text' ? 'var(--accent)' : 'var(--border)'}`, background: inputMode === 'text' ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)', color: inputMode === 'text' ? 'var(--accent)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                ✏️ Text
              </button>

              {voiceSupported ? (
                <button
                  onClick={isRecording ? stopVoice : startVoice}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isRecording ? 'var(--danger)' : inputMode === 'voice' ? 'var(--accent)' : 'var(--border)'}`, background: isRecording ? 'rgba(239,68,68,0.12)' : inputMode === 'voice' ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)', color: isRecording ? 'var(--danger)' : inputMode === 'voice' ? 'var(--accent)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isRecording ? <span className="animate-recording" style={{ display: 'inline-block' }}>🔴</span> : '🎤'}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  🎤 Voice: use Chrome/Edge
                </span>
              )}
            </div>

            {/* Recording status bar */}
            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                <span className="animate-recording" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)' }} />
                <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>Recording...</span>
                {interimTranscript && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                    "{interimTranscript}"
                  </span>
                )}
              </div>
            )}

            <textarea
              className="input-field"
              style={{ minHeight: 180, fontSize: 15, lineHeight: 1.7 }}
              placeholder={inputMode === 'voice' && !isRecording
                ? 'Click "Voice Input" above to start speaking, or type here...'
                : 'Type your answer here... Be detailed and structured. Use examples where appropriate.'}
              value={answer + (isRecording && interimTranscript ? ' ' + interimTranscript : '')}
              onChange={e => {
                if (!isRecording) {
                  setAnswer(e.target.value);
                  finalTranscriptRef.current = e.target.value;
                }
              }}
              readOnly={isRecording}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{answer.length} characters</span>
              <button
                onClick={submitAnswer}
                className="btn-primary"
                style={{ fontSize: 15, padding: '12px 28px' }}
                disabled={submitting || !answer.trim()}>
                {submitting
                  ? <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} /> Evaluating...</>
                  : 'Submit Answer →'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {phase === 'feedback' && feedback && (
          <div className="animate-fade-in">
            {/* Score card */}
            <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(13,20,32,1), rgba(17,25,39,1))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: scoreColor(feedback.score), lineHeight: 1 }}>{feedback.score}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 10</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Score Breakdown</div>
                  {[['Technical Depth', feedback.technicalDepth], ['Communication', feedback.communicationScore]].map(([label, val]) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                        <span style={{ fontWeight: 600, color: scoreColor(val) }}>{val}/10</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${val * 10}%`, background: `linear-gradient(90deg, ${scoreColor(val)}, ${scoreColor(val)}aa)` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 10 }}>✅ Strengths</div>
                {feedback.strengths?.length > 0
                  ? feedback.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)
                  : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notable strengths identified.</div>}
              </div>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--warning)', marginBottom: 10 }}>⚠️ To Improve</div>
                {feedback.weaknesses?.length > 0
                  ? feedback.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>• {w}</div>)
                  : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No major weaknesses.</div>}
              </div>
            </div>

            {/* Model answer */}
            {feedback.suggestedAnswer && (
              <div className="card" style={{ marginBottom: 14, borderColor: 'rgba(59,130,246,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--accent)', marginBottom: 10 }}>💡 Model Answer</div>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7 }}>{feedback.suggestedAnswer}</p>
              </div>
            )}

            {/* Follow-ups */}
            {followUps.length > 0 && (
              <div className="card" style={{ marginBottom: 14, background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--warning)', marginBottom: 10 }}>🔁 Follow-up to Consider</div>
                <p style={{ fontSize: 14, color: 'var(--text)' }}>{followUps[0]}</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* End early — always show after Q1 */}
              {questionNum < TOTAL_QUESTIONS && (
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="btn-secondary"
                  style={{ flex: '0 0 auto', padding: '14px 20px' }}>
                  🏁 Finish Early
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: 15, padding: '14px', minWidth: 180 }}>
                {questionNum >= TOTAL_QUESTIONS
                  ? '🏁 Finish & View Report'
                  : `Next Question (${questionNum}/${TOTAL_QUESTIONS}) →`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
