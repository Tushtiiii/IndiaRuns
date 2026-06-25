import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobsAPI, aiAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

const ScoreBar = ({ label, value, color = 'var(--accent-primary)' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value}/100</span>
    </div>
    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, borderRadius: 3,
        background: value >= 80 ? 'var(--gradient-success)' : value >= 60 ? 'linear-gradient(90deg, #f59e0b, #f97316)' : 'linear-gradient(90deg, #ef4444, #ec4899)',
        transition: 'width 0.8s ease',
      }} />
    </div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const cls = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
  return <div className={`score-badge ${cls}`}>{score}</div>;
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [filters, setFilters] = useState({ minScore: '', status: '', skills: '' });
  const [insightsLoading, setInsightsLoading] = useState(null);
  const [activeInsights, setActiveInsights] = useState({});
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getOne(id).then((r) => r.data),
  });

  const { data: rankedData, isLoading: rankedLoading, refetch: refetchRanked } = useQuery({
    queryKey: ['ranked', id],
    queryFn: () => aiAPI.getRankedApplications(id, filters).then((r) => r.data),
  });

  const rankMutation = useMutation({
    mutationFn: () => aiAPI.rankCandidates(id),
    onSuccess: () => {
      toast.success('AI ranking complete! ✨');
      refetchRanked();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Ranking failed'),
  });

  const fetchInsights = async (jobId, candidateId, appId) => {
    if (activeInsights[appId]) return;
    setInsightsLoading(appId);
    try {
      const { data } = await aiAPI.generateInsights(jobId, candidateId);
      setActiveInsights((prev) => ({ ...prev, [appId]: data.insights }));
    } catch (err) {
      toast.error('Failed to generate insights');
    } finally {
      setInsightsLoading(null);
    }
  };

  const job = jobData?.job;
  const applications = rankedData?.applications || [];

  const toggleCompare = (candidateId) => {
    setSelectedForCompare((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId)
        : prev.length < 3 ? [...prev, candidateId] : prev
    );
  };

  if (jobLoading) return <AppLayout><div style={{ padding: 40, textAlign: 'center' }}>Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Job Header */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: 6 }}>{job?.title}</h1>
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13, flexWrap: 'wrap' }}>
                {job?.company && <span>🏢 {job.company}</span>}
                <span>📍 {job?.location}</span>
                <span>👥 {job?.applicantCount || 0} applicants</span>
                {job?.parsedProfile?.experienceRange?.label && (
                  <span>⏱ {job.parsedProfile.experienceRange.label}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/recruiter/interview-questions', { state: { jobId: id, jobTitle: job?.title } })} style={btnSecondary}>
                🎯 Interview Qs
              </button>
              <button onClick={() => rankMutation.mutate()} disabled={rankMutation.isPending} style={btnPrimary}>
                {rankMutation.isPending ? '🤖 Ranking...' : '🚀 Run AI Ranking'}
              </button>
            </div>
          </div>

          {/* Required Skills */}
          {job?.parsedProfile?.requiredSkills?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.parsedProfile.requiredSkills.map((s) => (
                  <span key={s} style={tagStyle}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compare Banner */}
        {selectedForCompare.length > 1 && (
          <div style={{
            padding: '14px 24px', borderRadius: 'var(--radius-md)', marginBottom: 16,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 14 }}>
              {selectedForCompare.length} candidates selected for comparison
            </span>
            <button onClick={() => navigate('/recruiter/compare', {
              state: {
                candidateIds: selectedForCompare,
                applications: applications.filter((a) => selectedForCompare.includes(a.candidateId?._id)),
                job,
              }
            })} style={{ ...btnPrimary, padding: '8px 18px', fontSize: 13 }}>
              Compare Side-by-Side →
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            placeholder="Min score (0-100)"
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            style={{ ...filterInput, width: 160 }}
          />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={{ ...filterInput, width: 160 }}>
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            placeholder="Filter by skill"
            value={filters.skills}
            onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
            style={{ ...filterInput, flex: 1, minWidth: 140 }}
          />
          <button onClick={() => refetchRanked()} style={{ ...btnPrimary, padding: '10px 18px', fontSize: 13 }}>
            Apply Filters
          </button>
        </div>

        {/* Ranked Candidates */}
        {rankedLoading ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No ranked candidates yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Once candidates apply, click "Run AI Ranking" to score and rank them.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {applications.map((app, i) => {
              const c = app.candidateId;
              const isExpanded = selectedApp === app._id;
              const insights = activeInsights[app._id];

              return (
                <div key={app._id} className="glass-card" style={{
                  padding: 20, cursor: 'pointer',
                  borderColor: selectedForCompare.includes(c?._id) ? 'rgba(124,58,237,0.5)' : undefined,
                }}>
                  <div onClick={() => setSelectedApp(isExpanded ? null : app._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {/* Rank */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: i < 3 ? `var(--rank-${i+1}, var(--gradient-primary))` : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)',
                      ...(i === 0 ? { background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#000' }
                        : i === 1 ? { background: 'linear-gradient(135deg,#c0c0c0,#a8a8a8)', color: '#000' }
                        : i === 2 ? { background: 'linear-gradient(135deg,#cd7f32,#a0522d)', color: 'white' }
                        : { color: 'var(--text-secondary)' }),
                    }}>#{app.rank || i+1}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
                        {c?.userId?.name || 'Candidate'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c?.headline}</div>
                    </div>

                    {/* Score */}
                    {app.finalScore != null && <ScoreBadge score={app.finalScore} />}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleCompare(c?._id)} style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: 12,
                        background: selectedForCompare.includes(c?._id) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer',
                      }}>
                        {selectedForCompare.includes(c?._id) ? '✓ Compare' : 'Compare'}
                      </button>
                      {app.finalScore != null && (
                        <button onClick={() => fetchInsights(id, c?._id, app._id)} style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: 12,
                          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                          color: 'var(--accent-primary)', cursor: 'pointer',
                        }}>
                          {insightsLoading === app._id ? '⏳' : '💡 Insights'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        {/* Score Breakdown */}
                        {app.scoreBreakdown && (
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 14, fontSize: 14 }}>Score Breakdown</h4>
                            <ScoreBar label="Skill Match (30%)" value={app.scoreBreakdown.skillMatch} />
                            <ScoreBar label="Experience Match (25%)" value={app.scoreBreakdown.experienceMatch} />
                            <ScoreBar label="Project Relevance (15%)" value={app.scoreBreakdown.projectRelevance} />
                            <ScoreBar label="Career Growth (10%)" value={app.scoreBreakdown.careerGrowth} />
                            <ScoreBar label="Soft Skills (10%)" value={app.scoreBreakdown.softSkills} />
                            <ScoreBar label="Certifications (5%)" value={app.scoreBreakdown.certifications} />
                            <ScoreBar label="Platform Activity (5%)" value={app.scoreBreakdown.platformActivity} />
                          </div>
                        )}

                        {/* Skills + Info */}
                        <div>
                          <div style={{ marginBottom: 16 }}>
                            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 10, fontSize: 14 }}>Candidate Info</h4>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <span>🕐 {c?.totalExperienceYears} years experience</span>
                              {c?.location && <span>📍 {c.location}</span>}
                              {c?.topDomains?.length > 0 && <span>🏷 {c.topDomains.join(', ')}</span>}
                            </div>
                          </div>
                          {c?.skills?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Skills</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {c.skills.slice(0, 12).map((s) => (
                                  <span key={s} style={tagStyle}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Insights */}
                        {insights && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 14, fontSize: 14 }}>🤖 AI Insights</h4>
                            <div style={{
                              padding: 16, borderRadius: 'var(--radius-md)',
                              background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)',
                              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12,
                            }}>
                              {insights.summary}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <div>
                                <div style={{ fontSize: 12, color: 'var(--accent-success)', fontWeight: 700, marginBottom: 8 }}>✅ Strengths</div>
                                {insights.strengths?.map((s, i) => (
                                  <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</div>
                                ))}
                              </div>
                              <div>
                                <div style={{ fontSize: 12, color: 'var(--accent-warning)', fontWeight: 700, marginBottom: 8 }}>⚠️ Concerns</div>
                                {insights.concerns?.map((c, i) => (
                                  <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {c}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const tagStyle = {
  display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
  color: 'var(--accent-primary)', fontSize: 11, fontWeight: 500,
};
const filterInput = {
  padding: '10px 14px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)',
};
const btnPrimary = {
  padding: '12px 20px', borderRadius: 'var(--radius-md)',
  background: 'var(--gradient-primary)', color: 'white', border: 'none',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};
const btnSecondary = {
  padding: '12px 20px', borderRadius: 'var(--radius-md)',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-body)',
};
