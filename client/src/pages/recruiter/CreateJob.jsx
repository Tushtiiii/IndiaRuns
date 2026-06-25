import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { jobsAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', company: '', location: 'Remote', description: '', tags: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    toast.success(`File selected: ${acceptedFiles[0].name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description && !file) {
      toast.error('Please enter a job description or upload a file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      if (file) formData.append('jdFile', file);

      const { data } = await jobsAPI.create(formData);
      setAiResult(data.job.parsedProfile);
      toast.success('Job posted and AI-analyzed! ✨');
      setTimeout(() => navigate(`/recruiter/jobs/${data.job._id}`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 8 }}>Post a New Job</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            AI will automatically parse your job description and extract skills, requirements, and seniority.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Info */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 20 }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { label: 'Job Title *', key: 'title', placeholder: 'Senior MERN Developer' },
                { label: 'Company', key: 'company', placeholder: 'Acme Inc.' },
                { label: 'Location', key: 'location', placeholder: 'Remote / New York, NY' },
                { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'react, node, mongodb' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 8 }}>Job Description</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              Paste the JD text below <strong>or</strong> upload a PDF/DOCX file. AI will extract skills, experience requirements, and more.
            </p>

            <textarea
              rows={10} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Paste your full job description here..."
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />

            <div style={{ margin: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>— OR UPLOAD A FILE —</div>

            {/* Dropzone */}
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              background: isDragActive ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: 36, marginBottom: 10 }}>{file ? '✅' : '📄'}</div>
              <p style={{ color: file ? 'var(--accent-success)' : 'var(--text-secondary)', fontSize: 14 }}>
                {file ? file.name : isDragActive ? 'Drop your file here' : 'Drag & drop PDF, DOCX, or TXT — or click to browse'}
              </p>
              {file && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{ marginTop: 10, color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  ✕ Remove file
                </button>
              )}
            </div>
          </div>

          {/* AI Result Preview */}
          {aiResult && (
            <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.05)' }}>
              <h3 style={{ color: 'var(--accent-success)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
                ✨ AI Analysis Complete
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13 }}>
                {aiResult.requiredSkills?.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Required Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {aiResult.requiredSkills.map((s) => (
                        <span key={s} style={tagStyle('var(--accent-primary)')}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {aiResult.experienceRange?.label && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Experience</div>
                    <span style={tagStyle('var(--accent-secondary)')}>{aiResult.experienceRange.label}</span>
                  </div>
                )}
                {aiResult.seniorityLevel && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Seniority</div>
                    <span style={tagStyle('var(--accent-warning)')}>{aiResult.seniorityLevel}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate('/recruiter')} style={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
              {loading ? '🤖 AI is analyzing your JD...' : '✨ Post Job & Analyze with AI'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
};
const tagStyle = (color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
  background: `${color}22`, border: `1px solid ${color}44`, color, fontSize: 12, fontWeight: 500,
});
const btnPrimary = {
  padding: '13px 24px', borderRadius: 'var(--radius-md)',
  background: 'var(--gradient-primary)', color: 'white', border: 'none',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
const btnSecondary = {
  padding: '13px 24px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)', fontSize: 15, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-body)',
};
