import { useNavigate, Link } from 'react-router-dom';

const features = [
  { icon: '🧠', title: 'AI-Powered Matching', desc: 'Semantic understanding of job requirements and candidate profiles beyond keyword matching.' },
  { icon: '📊', title: 'Hybrid Scoring Engine', desc: '7-dimension weighted scoring: skills, experience, projects, career growth, certifications, and more.' },
  { icon: '💡', title: 'Explainable AI', desc: 'Detailed insights on why each candidate received their score. No black box decisions.' },
  { icon: '⚡', title: 'Real-Time Ranking', desc: 'Instantly rank all applicants the moment you run the AI analysis. Sort, filter, compare.' },
  { icon: '🎯', title: 'Interview Generator', desc: 'Auto-generate role-specific interview questions at beginner, intermediate, and advanced levels.' },
  { icon: '🤖', title: 'AI Chat Assistant', desc: 'Ask natural language questions about your candidate pool and get instant intelligent answers.' },
];

const stats = [
  { value: '10x', label: 'Faster Screening' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '7', label: 'Scoring Dimensions' },
  { value: '0', label: 'Bias Tolerance' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      {/* ─── Navbar ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(10, 11, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🎯</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>TalentAI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)', color: 'var(--text-primary)',
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s ease',
          }}>Log In</Link>
          <Link to="/register" style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', color: 'white',
            textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          top: '10%', left: '10%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          bottom: '20%', right: '15%', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 'var(--radius-full)',
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          fontSize: 13, color: 'var(--accent-primary)', marginBottom: 24, fontWeight: 500,
        }}>
          ✨ AI-Powered Recruitment Intelligence
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontFamily: 'var(--font-heading)',
          fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 900,
        }}>
          Hire the <span style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Right People</span>
          <br />Not Just Keyword Matches
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)', maxWidth: 620, marginBottom: 48, lineHeight: 1.7,
        }}>
          TalentAI understands your job requirements and candidate profiles semantically — 
          ranking applicants by real suitability using AI, not ATS keyword tricks.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} style={{
            padding: '14px 36px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', color: 'white',
            border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: 'var(--shadow-glow)', transition: 'transform 0.2s ease',
            fontFamily: 'var(--font-body)',
          }}>
            Start Hiring Smarter →
          </button>
          <button onClick={() => navigate('/register?role=candidate')} style={{
            padding: '14px 36px', borderRadius: 'var(--radius-full)',
            background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border-color)', fontSize: 16, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            I'm a Candidate
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 48, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
          Everything Recruiters Need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 64, fontSize: '1.1rem' }}>
          Powered by Google Gemini AI and semantic vector search
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 10, fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', padding: '60px 48px',
          background: 'var(--gradient-card)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
            Ready to transform hiring?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
            Create your free account and post your first job in under 2 minutes.
          </p>
          <button onClick={() => navigate('/register')} style={{
            padding: '14px 40px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', color: 'white',
            border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: 'var(--shadow-glow)', fontFamily: 'var(--font-body)',
          }}>
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        © 2025 TalentAI — AI-Powered Candidate Intelligence Platform
      </footer>
    </div>
  );
}
