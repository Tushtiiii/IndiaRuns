import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const recruiterLinks = [
  { to: '/recruiter', label: '🏠 Dashboard' },
  { to: '/recruiter/jobs/new', label: '➕ Post Job' },
  { to: '/recruiter/resume-ranker', label: '🤖 AI Resume Ranker' },
  { to: '/recruiter/interview-questions', label: '🎯 Interview Qs' },
  { to: '/recruiter/analytics', label: '📈 Analytics' },
];

const candidateLinks = [
  { to: '/candidate', label: '👤 My Profile' },
];

const adminLinks = [
  { to: '/admin', label: '🛡 Admin' },
  { to: '/recruiter/analytics', label: '📈 Analytics' },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const links = user?.role === 'recruiter' ? recruiterLinks
    : user?.role === 'admin' ? adminLinks
    : candidateLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', overflow: 'auto',
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
          }}>🎯</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            TalentAI
          </span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map(({ to, label }) => {
            const isActive = to === '/recruiter'
              ? location.pathname === '/recruiter'
              : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
            Signed in as
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white',
            }}>{user?.name?.[0] || '?'}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--accent-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '36px 32px', overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
