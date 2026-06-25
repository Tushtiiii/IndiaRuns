import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = {
  recruiter: {
    email: 'demo.recruiter@talentai.dev',
    password: 'Demo@1234',
    label: '💼 Try Recruiter Demo',
    color: 'var(--accent-primary)',
    bg: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.35)',
    name: 'Sarah Mitchell',
  },
  candidate: {
    email: 'demo.candidate@talentai.dev',
    password: 'Demo@1234',
    label: '👤 Try Candidate Demo',
    color: 'var(--accent-secondary)',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.35)',
    name: 'Arjun Sharma',
  },
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doLogin = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    dispatch(loginSuccess(data));
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await doLogin(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      redirectByRole(data.user.role);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    const acct = DEMO_ACCOUNTS[role];
    setDemoLoading(role);
    try {
      const data = await doLogin(acct.email, acct.password);
      toast.success(`👋 Signed in as ${acct.name} (${role})`);
      redirectByRole(data.user.role);
    } catch (err) {
      // Demo account may not exist yet — inform clearly
      toast.error(
        'Demo account not found. Ask your admin to run: npm run seed (in server/)',
        { duration: 5000 }
      );
    } finally {
      setDemoLoading(null);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'recruiter') navigate('/recruiter');
    else if (role === 'admin') navigate('/admin');
    else navigate('/candidate');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        top: '5%', right: '10%',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        bottom: '10%', left: '5%',
      }} />

      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
          }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Sign in to your TalentAI account
          </p>
        </div>

        {/* ── Demo Accounts ── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            ⚡ Quick Demo Access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(DEMO_ACCOUNTS).map(([role, acct]) => (
              <button
                key={role}
                onClick={() => handleDemo(role)}
                disabled={demoLoading !== null}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: acct.bg,
                  border: `1px solid ${acct.border}`,
                  color: acct.color,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: demoLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                  opacity: demoLoading && demoLoading !== role ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {demoLoading === role ? (
                  <span style={{ opacity: 0.7 }}>Signing in…</span>
                ) : (
                  <>
                    <span>{acct.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>
                      {acct.name}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            Password: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>Demo@1234</code>
          </p>
        </div>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        {/* ── Login Form ── */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
          padding: 32, display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading || demoLoading !== null} style={btnPrimary(loading)}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          {/* Google OAuth */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{ height: 1, background: 'var(--border-color)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 12px', fontSize: 12, color: 'var(--text-muted)' }}>OR</span>
          </div>

          <a href="/api/auth/google" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', color: 'var(--text-primary)',
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.03)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
};
const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  fontFamily: 'var(--font-body)', transition: 'border-color 0.2s ease',
};
const btnPrimary = (loading) => ({
  width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)',
  background: loading ? 'rgba(124,58,237,0.5)' : 'var(--gradient-primary)',
  color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
  transition: 'all 0.2s ease',
});
