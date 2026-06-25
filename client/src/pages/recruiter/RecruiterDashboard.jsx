import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 52, height: 52, borderRadius: 'var(--radius-md)',
      background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  </div>
);

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll({ limit: 50 }).then((r) => r.data),
  });

  const jobs = jobsData?.jobs || [];
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 6 }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your recruitment activity</p>
          </div>
          <button onClick={() => navigate('/recruiter/jobs/new')} style={{
            padding: '12px 24px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', color: 'white', border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-glow)',
          }}>
            ➕ Post New Job
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard icon="📋" label="Total Jobs" value={jobs.length} color="var(--accent-primary)" />
          <StatCard icon="✅" label="Active Jobs" value={activeJobs} color="var(--accent-success)" />
          <StatCard icon="👥" label="Total Applicants" value={totalApplicants} color="var(--accent-secondary)" />
          <StatCard icon="🏆" label="Shortlisted" value={jobs.reduce((s, j) => s + (j.shortlistedCount || 0), 0)} color="var(--accent-warning)" />
        </div>

        {/* Jobs List */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Your Job Postings</h2>
          <button onClick={() => navigate('/recruiter/analytics')} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
            color: 'var(--accent-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}>
            📈 View Analytics
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No jobs posted yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Post your first job and let AI find the best candidates</p>
            <button onClick={() => navigate('/recruiter/jobs/new')} style={{
              padding: '12px 28px', borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
              Post a Job Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {jobs.map((job) => (
              <div key={job._id} className="glass-card" style={{ padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => navigate(`/recruiter/jobs/${job._id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{job.title}</h3>
                      <span style={{
                        padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600,
                        background: job.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                        color: job.status === 'active' ? 'var(--accent-success)' : 'var(--text-muted)',
                        border: `1px solid ${job.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                        textTransform: 'capitalize',
                      }}>{job.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
                      {job.company && <span>🏢 {job.company}</span>}
                      <span>📍 {job.location || 'Remote'}</span>
                      <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent-secondary)' }}>
                        {job.applicantCount || 0}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Applicants</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent-success)' }}>
                        {job.shortlistedCount || 0}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Shortlisted</div>
                    </div>
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
