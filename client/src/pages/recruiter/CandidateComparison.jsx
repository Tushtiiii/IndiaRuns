import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';

const ScoreBar = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
      <div style={{
        height: '100%', width: `${value || 0}%`, borderRadius: 4,
        background: (value || 0) >= 80 ? 'var(--gradient-success)'
          : (value || 0) >= 60 ? 'linear-gradient(90deg,#f59e0b,#f97316)'
          : 'linear-gradient(90deg,#ef4444,#ec4899)',
      }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: 'right',
      color: (value || 0) >= 80 ? 'var(--accent-success)' : (value || 0) >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
      {value ?? '—'}
    </span>
  </div>
);

const metrics = [
  { key: 'finalScore', label: '🏆 Final Score', isMain: true },
  { key: 'skillMatch', label: 'Skill Match (30%)' },
  { key: 'experienceMatch', label: 'Experience Match (25%)' },
  { key: 'projectRelevance', label: 'Project Relevance (15%)' },
  { key: 'careerGrowth', label: 'Career Growth (10%)' },
  { key: 'softSkills', label: 'Soft Skills (10%)' },
  { key: 'certifications', label: 'Certifications (5%)' },
  { key: 'platformActivity', label: 'Platform Activity (5%)' },
];

export default function CandidateComparison() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { applications = [], job } = state || {};

  if (!applications.length) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12 }}>No candidates selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Go to a Job Detail page and select 2–3 candidates to compare.
          </p>
          <button onClick={() => navigate('/recruiter')} style={btnPrimary}>
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)} style={btnBack}>← Back</button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: 4 }}>Candidate Comparison</h1>
            {job && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>for {job.title}</p>}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 220, textAlign: 'left' }}>Metric</th>
                {applications.map((app) => {
                  const c = app.candidateId;
                  return (
                    <th key={app._id} style={thStyle}>
                      <div style={{ padding: '16px 8px' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%',
                          background: 'var(--gradient-primary)', margin: '0 auto 10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, fontWeight: 800, color: 'white',
                        }}>
                          {c?.userId?.name?.[0] || '?'}
                        </div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{c?.userId?.name || 'Candidate'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c?.headline?.slice(0, 50)}</div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key}>
                  <td style={tdLabelStyle(m.isMain)}>{m.label}</td>
                  {applications.map((app) => {
                    const value = m.isMain ? app.finalScore : app.scoreBreakdown?.[m.key];
                    return (
                      <td key={app._id} style={tdStyle(m.isMain)}>
                        {value != null ? <ScoreBar value={value} /> : <span style={{ color: 'var(--text-muted)' }}>Not scored</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Experience Row */}
              <tr>
                <td style={tdLabelStyle()}>Total Experience</td>
                {applications.map((app) => (
                  <td key={app._id} style={tdStyle()}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                      {app.candidateId?.totalExperienceYears ?? '?'} yrs
                    </span>
                  </td>
                ))}
              </tr>

              {/* Skills Row */}
              <tr>
                <td style={tdLabelStyle()}>Top Skills</td>
                {applications.map((app) => (
                  <td key={app._id} style={tdStyle()}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(app.candidateId?.skills || []).slice(0, 6).map((s) => (
                        <span key={s} style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 11,
                          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                          color: 'var(--accent-primary)', whiteSpace: 'nowrap',
                        }}>{s}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Recommendation Row */}
              <tr>
                <td style={tdLabelStyle()}>AI Recommendation</td>
                {applications.map((app) => (
                  <td key={app._id} style={tdStyle()}>
                    <RecommendationBadge value={app.aiInsights?.recommendation} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

const RecommendationBadge = ({ value }) => {
  const map = {
    strong_yes: { label: '⭐ Strong Yes', color: 'var(--accent-success)' },
    yes: { label: '✅ Yes', color: '#4ade80' },
    maybe: { label: '🤔 Maybe', color: 'var(--accent-warning)' },
    no: { label: '❌ No', color: 'var(--accent-danger)' },
    strong_no: { label: '🚫 Strong No', color: '#b91c1c' },
  };
  const r = map[value] || { label: '— Not analyzed', color: 'var(--text-muted)' };
  return <span style={{ color: r.color, fontWeight: 600, fontSize: 13 }}>{r.label}</span>;
};

const thStyle = { padding: 0, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', minWidth: 200 };
const tdLabelStyle = (isMain) => ({
  padding: '14px 16px', fontWeight: isMain ? 700 : 500,
  color: isMain ? 'var(--text-primary)' : 'var(--text-secondary)',
  fontSize: isMain ? 15 : 13,
  background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)',
  whiteSpace: 'nowrap',
});
const tdStyle = (isMain) => ({
  padding: '14px 20px', textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  background: isMain ? 'rgba(124,58,237,0.05)' : 'transparent',
});
const btnPrimary = {
  padding: '12px 24px', borderRadius: 'var(--radius-md)',
  background: 'var(--gradient-primary)', color: 'white', border: 'none',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
const btnBack = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
