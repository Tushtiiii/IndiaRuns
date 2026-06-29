import { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import './ResumeRanker.css';


// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

const RECOMMENDATION_META = {
  'Highly Recommended': { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '⭐' },
  Recommended:          { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: '✅' },
  Consider:             { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🤔' },
  'Not Recommended':    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '❌' },
};

const SAMPLE_CANDIDATES = [
  {
    id: "c1", name: "Aisha Sharma", email: "aisha@example.com", headline: "Full Stack Developer",
    totalExperienceYears: 4,
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
    topDomains: ["Full Stack", "Cloud"],
    summary: "Experienced full-stack developer with strong React and Node.js background. Built and deployed 5+ production apps.",
    education: [{ degree: "B.Tech", field: "Computer Science", institution: "IIT Delhi", endYear: "2020" }],
    projects: [{ name: "E-commerce Platform", technologies: ["React", "Node.js", "MongoDB"], description: "Built full-stack marketplace" }],
    certifications: [{ name: "AWS Solutions Architect", issuer: "Amazon", year: "2023" }],
    experience: [{ company: "TechCorp", title: "Senior Developer", startDate: "2022", endDate: "Present" }]
  },
  {
    id: "c2", name: "Rahul Verma", email: "rahul@example.com", headline: "Backend Engineer",
    totalExperienceYears: 2,
    skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
    topDomains: ["Backend", "Data Engineering"],
    summary: "Backend-focused engineer with Python expertise. Strong in API design and database optimization.",
    education: [{ degree: "B.E.", field: "Information Technology", institution: "VIT Vellore", endYear: "2022" }],
    projects: [{ name: "REST API Gateway", technologies: ["Python", "Docker", "Redis"], description: "Built high-throughput API gateway" }],
    certifications: [],
    experience: [{ company: "StartupXYZ", title: "Backend Developer", startDate: "2022", endDate: "Present" }]
  },
  {
    id: "c3", name: "Priya Nair", email: "priya@example.com", headline: "DevOps & Cloud Specialist",
    totalExperienceYears: 6,
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Docker", "Python"],
    topDomains: ["DevOps", "Cloud Infrastructure"],
    summary: "Senior DevOps engineer specializing in cloud-native infrastructure and automation at scale.",
    education: [{ degree: "M.Tech", field: "Computer Science", institution: "NIT Trichy", endYear: "2018" }],
    projects: [{ name: "Multi-cloud Platform", technologies: ["AWS", "Kubernetes", "Terraform"], description: "Managed cloud infra for 200+ microservices" }],
    certifications: [{ name: "CKA", issuer: "CNCF", year: "2022" }, { name: "AWS DevOps Pro", issuer: "Amazon", year: "2023" }],
    experience: [{ company: "Infosys", title: "Lead DevOps Engineer", startDate: "2020", endDate: "Present" }]
  }
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }) {
  const cls = score >= 75 ? 'score-high' : score >= 50 ? 'score-medium' : 'score-low';
  return (
    <div className={`score-ring ${cls}`} style={{ width: size, height: size, fontSize: size * 0.24 }}>
      {score}
    </div>
  );
}

function SkillPill({ label, matched }) {
  return (
    <span className={`skill-pill ${matched ? 'matched' : 'missing'}`}>{label}</span>
  );
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="progress-row">
      <span className="progress-label">{label}</span>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="progress-value">{value}</span>
    </div>
  );
}

function CandidateCard({ item, rank, onClick }) {
  const { candidate, scores, insights } = item;
  const rec = RECOMMENDATION_META[insights?.recommendation] || RECOMMENDATION_META['Consider'];
  return (
    <div className="candidate-card" onClick={onClick}>
      <div className="card-rank">
        <span className={`rank-badge ${rank <= 3 ? `rank-${rank}` : ''}`}>#{rank}</span>
        <ScoreRing score={scores.finalScore} size={60} />
      </div>
      <div className="card-main">
        <div className="card-header-row">
          <div>
            <h3 className="candidate-name">{candidate.name}</h3>
            <p className="candidate-headline">{candidate.headline || 'Candidate'}</p>
          </div>
          <span className="rec-badge" style={{ color: rec.color, background: rec.bg }}>
            {rec.icon} {insights?.recommendation || 'Consider'}
          </span>
        </div>
        <p className="card-summary">{insights?.summary || candidate.summary || '—'}</p>
        <div className="card-meta">
          {candidate.totalExperienceYears > 0 && (
            <span className="meta-chip">💼 {candidate.totalExperienceYears}y exp</span>
          )}
          {candidate.location && <span className="meta-chip">📍 {candidate.location}</span>}
          {candidate.certifications?.length > 0 && (
            <span className="meta-chip">🎓 {candidate.certifications.length} cert{candidate.certifications.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="card-skills">
          {(insights?.matchedSkills || []).slice(0, 4).map((s) => (
            <SkillPill key={s} label={s} matched />
          ))}
          {(insights?.missingSkills || []).slice(0, 2).map((s) => (
            <SkillPill key={s} label={s} matched={false} />
          ))}
        </div>
      </div>
      <div className="card-breakdown">
        <ProgressBar label="Skills" value={scores.skillMatch} color="#7c3aed" />
        <ProgressBar label="Experience" value={scores.experienceMatch} color="#06b6d4" />
        <ProgressBar label="Projects" value={scores.projectRelevance} color="#10b981" />
        <ProgressBar label="Education" value={scores.educationMatch} color="#f59e0b" />
      </div>
    </div>
  );
}

function DetailModal({ item, jdParsed, onClose }) {
  if (!item) return null;
  const { candidate, scores, insights } = item;
  const rec = RECOMMENDATION_META[insights?.recommendation] || RECOMMENDATION_META['Consider'];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-hero">
          <ScoreRing score={scores.finalScore} size={80} />
          <div>
            <h2 className="modal-name">{candidate.name}</h2>
            <p className="modal-headline">{candidate.headline}</p>
            <span className="rec-badge large" style={{ color: rec.color, background: rec.bg }}>
              {rec.icon} {insights?.recommendation}
            </span>
          </div>
        </div>

        <p className="modal-summary">{insights?.summary}</p>

        <div className="modal-grid">
          {/* Score Breakdown */}
          <div className="modal-section">
            <h4>📊 Match Breakdown</h4>
            <ProgressBar label="Skill Match" value={scores.skillMatch} color="#7c3aed" />
            <ProgressBar label="Experience" value={scores.experienceMatch} color="#06b6d4" />
            <ProgressBar label="Projects" value={scores.projectRelevance} color="#10b981" />
            <ProgressBar label="Education" value={scores.educationMatch} color="#f59e0b" />
            <ProgressBar label="Certifications" value={scores.certifications} color="#ec4899" />
          </div>

          {/* Skills */}
          <div className="modal-section">
            <h4>🎯 Skills Analysis</h4>
            <p className="modal-sublabel">Matched Skills</p>
            <div className="skills-wrap">
              {(insights?.matchedSkills || []).map((s) => <SkillPill key={s} label={s} matched />)}
              {(insights?.matchedSkills || []).length === 0 && <span className="empty-note">None matched</span>}
            </div>
            <p className="modal-sublabel" style={{ marginTop: 12 }}>Missing Skills</p>
            <div className="skills-wrap">
              {(insights?.missingSkills || []).map((s) => <SkillPill key={s} label={s} matched={false} />)}
              {(insights?.missingSkills || []).length === 0 && <span className="empty-note">No gaps found</span>}
            </div>
          </div>

          {/* Strengths & Concerns */}
          <div className="modal-section">
            <h4>💪 Key Strengths</h4>
            <ul className="insight-list green">
              {(insights?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="modal-section">
            <h4>⚠️ Concerns</h4>
            <ul className="insight-list red">
              {(insights?.concerns || []).map((c, i) => <li key={i}>{c}</li>)}
              {(insights?.concerns || []).length === 0 && <li style={{ color: 'var(--accent-success)' }}>No major concerns</li>}
            </ul>
          </div>

          {/* JD vs Resume */}
          <div className="modal-section full-width">
            <h4>📋 JD vs Resume Comparison</h4>
            <p className="insight-text">{insights?.jdVsResumeNotes}</p>
          </div>

          {/* Relevant Experience */}
          <div className="modal-section full-width">
            <h4>💼 Relevant Experience</h4>
            <p className="insight-text">{insights?.relevantExperience}</p>
          </div>

          {/* Recommendation */}
          <div className="modal-section full-width rec-section" style={{ borderColor: rec.color }}>
            <h4 style={{ color: rec.color }}>{rec.icon} Recommendation: {insights?.recommendation}</h4>
            <p className="insight-text">{insights?.recommendationReason}</p>
          </div>

          {/* Interview Focus */}
          {insights?.interviewFocus?.length > 0 && (
            <div className="modal-section full-width">
              <h4>🎤 Interview Focus Areas</h4>
              <ul className="insight-list blue">
                {insights.interviewFocus.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <div className="modal-section">
              <h4>🎓 Education</h4>
              {candidate.education.map((e, i) => (
                <div key={i} className="edu-item">
                  <strong>{e.degree} in {e.field}</strong>
                  <span>{e.institution} · {e.endYear}</span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {candidate.certifications?.length > 0 && (
            <div className="modal-section">
              <h4>📜 Certifications</h4>
              {candidate.certifications.map((c, i) => (
                <div key={i} className="edu-item">
                  <strong>{c.name}</strong>
                  <span>{c.issuer} · {c.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadZone({ label, accept, file, onChange, hint }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange({ target: { files: [f] } });
  }, [onChange]);
  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={onChange} />
      {file ? (
        <>
          <div className="upload-icon success">✅</div>
          <p className="upload-filename">{file.name}</p>
          <p className="upload-hint">Click to replace</p>
        </>
      ) : (
        <>
          <div className="upload-icon">📄</div>
          <p className="upload-label">{label}</p>
          <p className="upload-hint">{hint}</p>
        </>
      )}
    </div>
  );
}

// ─── Guest Navbar (shown when not inside AppLayout) ────────────────────────────
function GuestNav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 40px',
      background: 'rgba(10, 11, 20, 0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🎯</div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>TalentAI</span>
      </Link>
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/login" style={{
          padding: '8px 20px', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)', color: 'var(--text-primary)',
          textDecoration: 'none', fontSize: 13, fontWeight: 500,
        }}>Log In</Link>
        <Link to="/register" style={{
          padding: '8px 20px', borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-primary)', color: 'white',
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}>Sign Up Free</Link>
      </div>
    </nav>
  );
}

// ─── Login Save Banner ─────────────────────────────────────────────────────────
function LoginSaveBanner({ onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'linear-gradient(90deg, rgba(124,58,237,0.18) 0%, rgba(6,182,212,0.12) 100%)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 24,
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>💾</span>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
            You're using TalentAI as a guest.
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 6 }}>
            Results won't be saved. Log in to save, export, and manage your analyses.
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Link to="/login" style={{
          padding: '7px 18px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(124,58,237,0.5)', color: 'var(--accent-primary)',
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}>Log In</Link>
        <Link to="/register" style={{
          padding: '7px 18px', borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-primary)', color: 'white',
          textDecoration: 'none', fontSize: 13, fontWeight: 700,
        }}>Create Free Account</Link>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px',
        }}>✕</button>
      </div>
    </div>
  );
}

// ─── Post-Analysis Guest Alert ─────────────────────────────────────────────────
function GuestResultAlert({ onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 22px',
      background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)',
      border: '1px solid rgba(16,185,129,0.35)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 20,
    }}>
      <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>🎉</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
          Analysis complete! Create a free account to save these results.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your ranked candidates won't be stored as a guest. Sign up free to save analyses,
          compare candidates over time, and access the full recruiter dashboard.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Link to="/register" style={{
            padding: '8px 22px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', color: 'white',
            textDecoration: 'none', fontSize: 13, fontWeight: 700,
          }}>Create Free Account →</Link>
          <Link to="/login" style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
            textDecoration: 'none', fontSize: 13, fontWeight: 500,
          }}>Log In</Link>
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: 16, flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumeRanker() {
  const { token, user } = useSelector((s) => s.auth);
  const isGuest = !token || !user;
  const navigate = useNavigate();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showResultAlert, setShowResultAlert] = useState(false);

  const [jdFile, setJdFile] = useState(null);
  const [candidatesFile, setCandidatesFile] = useState(null); // .json/.jsonl file
  const [candidatesText, setCandidatesText] = useState('');
  const [candidateInputMode, setCandidateInputMode] = useState('file'); // 'file' | 'text'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', pct: 0 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);


  // Filters
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');

  const loadSample = () => {
    setCandidateInputMode('text');
    setCandidatesText(JSON.stringify(SAMPLE_CANDIDATES, null, 2));
  };

  // ── Download helpers ──────────────────────────────────────────────────────────
  const downloadJSON = () => {
    if (!results) return;
    const output = {
      meta: { generatedAt: new Date().toISOString(), jobTitle: results.jobTitle, totalCandidates: results.totalCandidates },
      jobDescription: results.jdParsed,
      rankedCandidates: results.rankedCandidates.map(({ rank, candidate, scores, insights }) => ({
        rank, name: candidate.name, email: candidate.email || '',
        overallScore: scores.finalScore,
        recommendation: insights.recommendation,
        scoreBreakdown: scores,
        aiSummary: insights.summary,
        strengths: insights.strengths,
        concerns: insights.concerns,
        matchedSkills: insights.matchedSkills,
        missingSkills: insights.missingSkills,
        recommendationReason: insights.recommendationReason,
      })),
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ranked_candidates_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!results) return;
    const headers = ['Rank','Name','Email','Score','Recommendation','SkillMatch','ExperienceMatch','ProjectRelevance','EducationMatch','Certifications','MatchedSkills','MissingSkills'];
    const rows = results.rankedCandidates.map(({ rank, candidate, scores, insights }) => [
      rank, candidate.name, candidate.email || '',
      scores.finalScore, insights.recommendation,
      scores.skillMatch, scores.experienceMatch, scores.projectRelevance,
      scores.educationMatch, scores.certifications,
      (insights.matchedSkills || []).join('; '),
      (insights.missingSkills || []).join('; '),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ranked_candidates_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };


  const handleAnalyze = async () => {
    setError('');
    if (!jdFile) return setError('Please upload a Job Description file.');

    // Validate candidate input based on mode
    if (candidateInputMode === 'file') {
      if (!candidatesFile) return setError('Please upload a candidates .json or .jsonl file.');
    } else {
      try {
        const parsed = JSON.parse(candidatesText);
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
        if (parsed.length > 50) return setError('Maximum 50 candidates allowed.');
      } catch {
        return setError('Candidates must be a valid non-empty JSON array.');
      }
    }

    setIsAnalyzing(true);
    setResults(null);

    const stages = [
      { stage: '📄 Parsing job description…', pct: 10 },
      { stage: '🧠 Generating semantic embeddings…', pct: 30 },
      { stage: '🔍 Analyzing candidate profiles…', pct: 60 },
      { stage: '✨ Generating AI insights…', pct: 85 },
      { stage: '🏆 Ranking candidates…', pct: 95 },
    ];
    let si = 0;
    const tick = setInterval(() => { if (si < stages.length) { setProgress(stages[si]); si++; } }, 800);

    try {
      const form = new FormData();
      form.append('jdFile', jdFile);
      if (candidateInputMode === 'file') {
        form.append('candidatesFile', candidatesFile);
      } else {
        form.append('candidates', candidatesText);
      }

      const res = await fetch(`${API_BASE}/ranker/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResults(data);
      setProgress({ stage: '✅ Analysis complete!', pct: 100 });
      if (isGuest) setShowResultAlert(true);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(tick);
      setIsAnalyzing(false);
    }
  };


  // Filter + sort results
  const displayed = results
    ? [...results.rankedCandidates]
        .filter((item) => {
          if (item.scores.finalScore < minScore) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          const name = (item.candidate.name || '').toLowerCase();
          const skills = (item.candidate.skills || []).join(' ').toLowerCase();
          return name.includes(q) || skills.includes(q);
        })
        .sort((a, b) =>
          sortOrder === 'desc'
            ? b.scores.finalScore - a.scores.finalScore
            : a.scores.finalScore - b.scores.finalScore
        )
    : [];

  const content = (
    <div className="ranker-page">
      {/* Guest banner */}
      {isGuest && !bannerDismissed && (
        <LoginSaveBanner onDismiss={() => setBannerDismissed(true)} />
      )}
      {/* Guest result alert */}
      {isGuest && showResultAlert && (
        <GuestResultAlert onDismiss={() => setShowResultAlert(false)} />
      )}

      {/* ── Header ── */}
        <div className="ranker-header">
          <div>
            <h1 className="ranker-title">
              <span className="gradient-text">AI Resume Ranker</span>
            </h1>
            <p className="ranker-subtitle">
              Upload a JD + candidate list → get AI-powered rankings with semantic understanding
            </p>
          </div>
          {results && (
            <div className="result-stat-row">
              <div className="result-stat">
                <span className="stat-num">{results.totalCandidates}</span>
                <span className="stat-lbl">Analyzed</span>
              </div>
              <div className="result-stat">
                <span className="stat-num" style={{ color: '#10b981' }}>
                  {results.rankedCandidates.filter((r) => r.scores.finalScore >= 75).length}
                </span>
                <span className="stat-lbl">Strong Matches</span>
              </div>
              <div className="result-stat">
                <span className="stat-num" style={{ color: '#7c3aed' }}>
                  {results.rankedCandidates[0]?.scores.finalScore ?? '—'}
                </span>
                <span className="stat-lbl">Top Score</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Upload Section ── */}
        {!results && (
          <div className="upload-section">
            <div className="upload-grid">
              <div className="upload-col">
                <h3 className="upload-col-title">📋 Job Description</h3>
                <UploadZone
                  label="Upload JD File"
                  accept=".pdf,.docx,.txt"
                  file={jdFile}
                  onChange={(e) => setJdFile(e.target.files[0] || null)}
                  hint="PDF, DOCX, or TXT · max 10 MB"
                />
              </div>
              <div className="upload-col">
                <div className="json-col-header">
                  <h3 className="upload-col-title">👥 Candidates</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`tab-btn ${candidateInputMode === 'file' ? 'active' : ''}`}
                      onClick={() => setCandidateInputMode('file')}
                    >📁 File</button>
                    <button
                      className={`tab-btn ${candidateInputMode === 'text' ? 'active' : ''}`}
                      onClick={() => setCandidateInputMode('text')}
                    >✏️ JSON</button>
                    <button className="sample-btn" onClick={loadSample}>Load Sample</button>
                  </div>
                </div>

                {candidateInputMode === 'file' ? (
                  <>
                    <UploadZone
                      label="Upload Candidates File"
                      accept=".json,.jsonl"
                      file={candidatesFile}
                      onChange={(e) => setCandidatesFile(e.target.files[0] || null)}
                      hint=".json or .jsonl · candidate_schema.json / candidates.jsonl / sample_candidates.json"
                    />
                    <p className="json-hint" style={{ marginTop: 8 }}>
                      Supports: <strong>candidates.jsonl</strong> (JSON Lines), <strong>sample_candidates.json</strong> (JSON array),
                      or any <strong>.json</strong> file with an array of candidate objects.
                    </p>
                  </>
                ) : (
                  <>
                    <textarea
                      className="json-textarea"
                      placeholder={'[\n  {\n    "name": "Jane Doe",\n    "skills": ["React", "Node.js"],\n    "totalExperienceYears": 3\n  }\n]'}
                      value={candidatesText}
                      onChange={(e) => setCandidatesText(e.target.value)}
                      spellCheck={false}
                    />
                    <p className="json-hint">
                      Each object: name, skills[], totalExperienceYears, experience[], education[], projects[], certifications[]
                    </p>
                  </>
                )}
              </div>

            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}

            <button
              className={`analyze-btn ${isAnalyzing ? 'loading' : ''}`}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '⏳ Analyzing…' : '🚀 Analyze & Rank Candidates'}
            </button>
          </div>
        )}

        {/* ── Progress ── */}
        {isAnalyzing && (
          <div className="progress-section">
            <div className="progress-stage">{progress.stage}</div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${progress.pct}%` }} />
            </div>
            <p className="progress-note">AI is semantically analyzing each candidate…</p>
          </div>
        )}

        {/* ── Results ── */}
        {results && !isAnalyzing && (
          <>
            <div className="results-toolbar">
              <div className="toolbar-left">
                <input
                  className="search-input"
                  placeholder="🔍 Search by name or skill…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="filter-group">
                  <label>Min Score</label>
                  <input
                    type="number" min={0} max={100}
                    className="score-filter"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                  />
                </div>
                <select
                  className="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">↓ Highest Score First</option>
                  <option value="asc">↑ Lowest Score First</option>
                </select>
              </div>
              <div className="toolbar-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="download-btn json" onClick={downloadJSON} title="Download ranked results as JSON">
                  ⬇️ JSON
                </button>
                <button className="download-btn csv" onClick={downloadCSV} title="Download ranked results as CSV">
                  📊 CSV
                </button>
                <button className="reset-btn" onClick={() => {
                  setResults(null); setJdFile(null); setCandidatesFile(null);
                  setCandidatesText(''); setError(''); setSearch(''); setMinScore(0);
                }}>
                  🔄 New Analysis
                </button>
              </div>

            </div>

            <div className="jd-summary-bar">
              <span className="jd-role">📋 {results.jobTitle}</span>
              {results.jdParsed?.seniorityLevel && <span className="jd-chip">{results.jdParsed.seniorityLevel}</span>}
              {results.jdParsed?.experienceRange?.label && <span className="jd-chip">⏱ {results.jdParsed.experienceRange.label}</span>}
              {(results.jdParsed?.requiredSkills || []).slice(0, 5).map((s) => (
                <span key={s} className="jd-chip skill">{s}</span>
              ))}
            </div>

            <div className="candidates-list">
              {displayed.length === 0 ? (
                <div className="empty-results">
                  <div style={{ fontSize: 48 }}>🔍</div>
                  <h3>No candidates match your filters</h3>
                  <p>Try lowering the minimum score or clearing the search.</p>
                </div>
              ) : (
                displayed.map((item) => (
                  <CandidateCard
                    key={item.candidate.id || item.candidate.email || item.rank}
                    item={item}
                    rank={item.rank}
                    onClick={() => setSelectedItem(item)}
                  />
                ))
              )}
            </div>
          </>
        )}

      {/* ── Detail Modal ── */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            jdParsed={results?.jdParsed}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
  );

  // Render with appropriate layout
  if (isGuest) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
        <GuestNav />
        <div style={{ paddingTop: 70 }}>
          {content}
        </div>
      </div>
    );
  }

  return <AppLayout>{content}</AppLayout>;
}
