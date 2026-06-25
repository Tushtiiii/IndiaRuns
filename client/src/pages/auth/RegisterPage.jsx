import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'candidate';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      dispatch(loginSuccess(data));
      toast.success('Account created! Welcome to TalentAI 🎉');
      if (data.user.role === 'recruiter') navigate('/recruiter');
      else navigate('/candidate');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        bottom: '5%', left: '5%',
      }} />

      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 16px',
          }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Join TalentAI and transform hiring</p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24,
          border: '1px solid var(--border-color)',
        }}>
          {['candidate', 'recruiter'].map((role) => (
            <button key={role} onClick={() => setForm({ ...form, role })} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              background: form.role === role ? 'var(--gradient-primary)' : 'transparent',
              color: form.role === role ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              textTransform: 'capitalize', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
            }}>
              {role === 'candidate' ? '👤 Candidate' : '💼 Recruiter'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
          padding: 36, display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@company.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                {label}
              </label>
              <input
                type={type} required value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={btnPrimary(loading)}>
            {loading ? 'Creating account...' : `Create ${form.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Account →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
};

const btnPrimary = (loading) => ({
  width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)',
  background: loading ? 'rgba(124,58,237,0.5)' : 'var(--gradient-primary)',
  color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
});
