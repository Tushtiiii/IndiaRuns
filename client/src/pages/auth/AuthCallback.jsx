import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('token');
    const role = params.get('role');

    if (!token) { navigate('/login'); return; }

    // Set token first so the API interceptor picks it up
    localStorage.setItem('token', token);

    authAPI.getProfile()
      .then(({ data }) => {
        dispatch(loginSuccess({ token, user: data.user }));
        if (role === 'recruiter') navigate('/recruiter');
        else if (role === 'admin') navigate('/admin');
        else navigate('/candidate');
      })
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: 24, animation: 'pulse-glow 1.5s infinite',
      }}>🎯</div>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        Completing sign in...
      </p>
    </div>
  );
}
