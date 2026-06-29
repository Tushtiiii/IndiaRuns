import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Sample data shown in preview ─────────────────────────────────────────────
const PREVIEW_CANDIDATES = [
  {
    name: 'Aisha Sharma',
    headline: 'Full Stack Developer · 4y exp',
    score: 91,
    recommendation: 'Highly Recommended',
    recColor: '#10b981',
    recBg: 'rgba(16,185,129,0.12)',
    skills: ['React', 'Node.js', 'AWS'],
  },
  {
    name: 'Priya Nair',
    headline: 'DevOps & Cloud Specialist · 6y exp',
    score: 78,
    recommendation: 'Recommended',
    recColor: '#06b6d4',
    recBg: 'rgba(6,182,212,0.12)',
    skills: ['Kubernetes', 'Terraform', 'Docker'],
  },
  {
    name: 'Rahul Verma',
    headline: 'Backend Engineer · 2y exp',
    score: 54,
    recommendation: 'Consider',
    recColor: '#f59e0b',
    recBg: 'rgba(245,158,11,0.12)',
    skills: ['Python', 'Django', 'Redis'],
  },
];

// ─── Mini score ring ───────────────────────────────────────────────────────────
function MiniRing({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color,
      flexShrink: 0,
      background: `${color}14`,
    }}>
      {score}
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────
export default function RankerPreviewWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* ── Floating trigger button ── */}
      <div style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 900,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
      }}>
        {/* Tooltip label */}
        {!open && (
          <div style={{
            background: 'rgba(10,11,20,0.92)', border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 10, padding: '6px 12px',
            fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.4s ease',
            whiteSpace: 'nowrap',
          }}>
            👀 Preview AI Ranker
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? 'Close preview' : 'Preview AI Ranker'}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: open
              ? 'rgba(239,68,68,0.85)'
              : 'var(--gradient-primary)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: open
              ? '0 4px 20px rgba(239,68,68,0.4)'
              : '0 4px 28px rgba(124,58,237,0.55)',
            transition: 'all 0.25s ease',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          {open ? '✕' : '🤖'}
        </button>
      </div>

      {/* ── Preview popup panel ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 104, right: 28, zIndex: 899,
          width: 370,
          background: 'rgba(14,15,26,0.97)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
          backdropFilter: 'blur(24px)',
          overflow: 'hidden',
          animation: 'slideUpIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          fontFamily: 'var(--font-body)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)',
            borderBottom: '1px solid rgba(124,58,237,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <span style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-heading)' }}>
                  AI Resume Ranker
                </span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                padding: '3px 8px', borderRadius: 20,
                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)',
              }}>PREVIEW</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
              Sample ranking for <strong style={{ color: 'var(--text-secondary)' }}>Senior Full Stack Developer</strong>
            </p>
          </div>

          {/* Candidate list */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREVIEW_CANDIDATES.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                transition: 'background 0.15s',
                cursor: 'default',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                {/* Rank badge */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                    : i === 1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)'
                    : 'linear-gradient(135deg,#92400e,#78350f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.headline}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.skills.map((s) => (
                      <span key={s} style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 6,
                        background: 'rgba(124,58,237,0.12)', color: '#a78bfa',
                        border: '1px solid rgba(124,58,237,0.2)',
                        fontWeight: 600,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Score ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  <MiniRing score={c.score} />
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                    background: c.recBg, color: c.recColor,
                    maxWidth: 70, textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {c.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upload hint */}
          <div style={{
            margin: '0 16px 12px',
            padding: '10px 14px',
            background: 'rgba(6,182,212,0.05)',
            border: '1px dashed rgba(6,182,212,0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload your JD + candidates</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF / DOCX / JSON · No account required</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
            <button
              onClick={() => { navigate('/resume-ranker'); setOpen(false); }}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                background: 'var(--gradient-primary)', color: 'white',
                border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Open Full Ranker →
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '11px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
