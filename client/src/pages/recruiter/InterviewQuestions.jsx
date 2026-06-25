import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { aiAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

export default function InterviewQuestions() {
  const { state } = useLocation();
  const [form, setForm] = useState({ jobId: state?.jobId || '', jobTitle: state?.jobTitle || '', jobDescription: '', level: 'mid' });
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.jobId && !form.jobDescription) {
      toast.error('Please enter a job description or provide a job ID.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await aiAPI.generateInterviewQuestions(form);
      setQuestions(data.questions);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    technical: 'var(--accent-primary)',
    behavioral: 'var(--accent-secondary)',
    situational: 'var(--accent-warning)',
    culture_fit: 'var(--accent-success)',
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 8 }}>
            🎯 Interview Question Generator
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            AI generates tailored technical, behavioral, and situational questions based on the role.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Job Title</label>
              <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g. Senior React Developer" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Seniority Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={inputStyle}>
                <option value="junior">Junior (0–2 yrs)</option>
                <option value="mid">Mid-level (2–5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
                <option value="staff">Staff / Lead</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Job Description (Optional)</label>
            <textarea
              rows={6} value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              placeholder="Paste JD for more targeted questions..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 16, width: '100%' }}>
            {loading ? '🤖 Generating questions...' : '✨ Generate Interview Questions'}
          </button>
        </form>

        {questions && (
          <div>
            {Object.entries(questions).map(([category, qs]) => {
              if (!qs?.length) return null;
              const color = categoryColors[category] || 'var(--text-primary)';
              const icons = { technical: '⚙️', behavioral: '💬', situational: '🧩', culture_fit: '🌱' };
              return (
                <div key={category} className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', marginBottom: 16, color }}>
                    {icons[category]} {category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Questions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {qs.map((q, i) => (
                      <div key={i} style={{
                        padding: '14px 16px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                      }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            background: `${color}22`, border: `1px solid ${color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color,
                          }}>{i + 1}</div>
                          <div>
                            <p style={{ marginBottom: q.hint ? 8 : 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                              {q.question || q}
                            </p>
                            {q.hint && (
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                💡 Look for: {q.hint}
                              </p>
                            )}
                            {q.difficulty && (
                              <span style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 99,
                                background: q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : q.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                color: q.difficulty === 'hard' ? 'var(--accent-danger)' : q.difficulty === 'medium' ? 'var(--accent-warning)' : 'var(--accent-success)',
                                fontWeight: 600, textTransform: 'capitalize', marginTop: 6, display: 'inline-block',
                              }}>
                                {q.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button onClick={() => {
              const text = Object.entries(questions)
                .map(([cat, qs]) => `## ${cat.toUpperCase()}\n${qs.map((q, i) => `${i+1}. ${q.question || q}`).join('\n')}`)
                .join('\n\n');
              navigator.clipboard.writeText(text);
              toast.success('Questions copied to clipboard!');
            }} style={{ ...btnSecondary, width: '100%', marginTop: 8 }}>
              📋 Copy All Questions
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 };
const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
};
const btnPrimary = {
  padding: '13px 24px', borderRadius: 'var(--radius-md)',
  background: 'var(--gradient-primary)', color: 'white', border: 'none',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
const btnSecondary = {
  padding: '13px 24px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-body)',
};
