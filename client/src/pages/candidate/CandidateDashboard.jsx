import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidatesAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

const SkillTag = ({ label }) => (
  <span style={{
    display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-full)',
    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
    color: 'var(--accent-primary)', fontSize: 12, fontWeight: 500,
  }}>{label}</span>
);

export default function CandidateDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [file, setFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidatesAPI.getProfile().then((r) => r.data),
  });

  const { data: appsData } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => candidatesAPI.getApplications().then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => candidatesAPI.uploadResume(formData),
    onSuccess: ({ data }) => {
      setParsedPreview(data.candidate?.parsedData);
      queryClient.invalidateQueries(['candidateProfile']);
      toast.success('Resume parsed and profile updated! ✨');
      setFile(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Upload failed'),
  });

  const onDrop = useCallback((accepted) => { setFile(accepted[0]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    uploadMutation.mutate(fd);
  };

  const candidate = profileData?.candidate;
  const applications = appsData?.applications || [];

  const tabs = [
    { key: 'profile', label: '👤 My Profile' },
    { key: 'resume', label: '📄 Resume' },
    { key: 'applications', label: `📋 Applications (${applications.length})` },
  ];

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {candidate?.userId?.name?.[0] || '?'}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: 4 }}>
                {candidate?.userId?.name || 'Complete your profile'}
              </h1>
              {candidate?.headline && <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{candidate.headline}</p>}
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {candidate?.totalExperienceYears != null && <span>⏱ {candidate.totalExperienceYears} yrs experience</span>}
                {candidate?.location && <span>📍 {candidate.location}</span>}
              </div>
            </div>
            {candidate?.profileScore != null && (
              <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: `conic-gradient(var(--gradient-primary) ${candidate.profileScore * 3.6}deg, rgba(255,255,255,0.08) 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
                  }}>
                    {candidate.profileScore}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Profile Score</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border-color)' }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
              background: activeTab === key ? 'var(--gradient-primary)' : 'transparent',
              color: activeTab === key ? 'white' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>{label}</button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {!candidate && (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Upload your resume to get started</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                  AI will parse your resume and build your professional profile automatically.
                </p>
                <button onClick={() => setActiveTab('resume')} style={btnPrimary}>Upload Resume →</button>
              </div>
            )}

            {candidate?.skills?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {candidate.skills.map((s) => <SkillTag key={s} label={s} />)}
                </div>
              </div>
            )}

            {candidate?.education?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem' }}>Education</h3>
                {candidate.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < candidate.education.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{e.degree} — {e.institution}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {e.field} {e.graduationYear && `· ${e.graduationYear}`} {e.gpa && `· GPA ${e.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {candidate?.workExperience?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem' }}>Experience</h3>
                {candidate.workExperience.map((w, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < candidate.workExperience.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{w.role} @ {w.company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {w.startDate} – {w.endDate || 'Present'} · {w.location}
                    </div>
                    {w.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{w.description}</p>}
                    {w.technologies?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {w.technologies.map((t) => <SkillTag key={t} label={t} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, fontSize: '1.1rem' }}>Upload / Update Resume</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              AI will extract your skills, experience, education, projects, and certifications automatically.
            </p>

            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>{file ? '✅' : '📄'}</div>
              <p style={{ color: file ? 'var(--accent-success)' : 'var(--text-secondary)', fontSize: 15, marginBottom: 4 }}>
                {file ? file.name : 'Drag & drop your resume here'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>PDF, DOCX, or TXT up to 5MB</p>
            </div>

            {file && (
              <button onClick={handleUpload} disabled={uploadMutation.isPending} style={{ ...btnPrimary, width: '100%', marginTop: 16 }}>
                {uploadMutation.isPending ? '🤖 Parsing resume...' : '✨ Parse & Update Profile with AI'}
              </button>
            )}

            {parsedPreview && (
              <div style={{ marginTop: 24, padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <h4 style={{ color: 'var(--accent-success)', marginBottom: 12 }}>✨ AI Extracted</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {parsedPreview.totalExperience != null && <div>⏱ {parsedPreview.totalExperience} yrs experience</div>}
                  {parsedPreview.skills?.length > 0 && <div>🛠 {parsedPreview.skills.length} skills found</div>}
                  {parsedPreview.education?.length > 0 && <div>🎓 {parsedPreview.education.length} education entries</div>}
                  {parsedPreview.workExperience?.length > 0 && <div>💼 {parsedPreview.workExperience.length} roles found</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {applications.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No applications yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Browse open jobs and apply to get started.</p>
              </div>
            ) : applications.map((app) => (
              <div key={app._id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                      {app.jobId?.title || 'Job'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {app.jobId?.company} · Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {app.finalScore != null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
                          color: app.finalScore >= 80 ? 'var(--accent-success)' : app.finalScore >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                        }}>{app.finalScore}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Score</div>
                      </div>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                      background: statusStyle[app.status]?.bg || 'rgba(100,116,139,0.1)',
                      color: statusStyle[app.status]?.color || 'var(--text-muted)',
                      border: `1px solid ${statusStyle[app.status]?.border || 'rgba(100,116,139,0.2)'}`,
                      textTransform: 'capitalize',
                    }}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const statusStyle = {
  applied: { bg: 'rgba(6,182,212,0.1)', color: 'var(--accent-secondary)', border: 'rgba(6,182,212,0.3)' },
  shortlisted: { bg: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', border: 'rgba(16,185,129,0.3)' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: 'rgba(239,68,68,0.3)' },
  hired: { bg: 'rgba(245,158,11,0.1)', color: 'var(--accent-warning)', border: 'rgba(245,158,11,0.3)' },
};

const btnPrimary = {
  padding: '13px 24px', borderRadius: 'var(--radius-md)',
  background: 'var(--gradient-primary)', color: 'white', border: 'none',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
