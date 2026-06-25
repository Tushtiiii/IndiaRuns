import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { aiAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => aiAPI.getAnalytics().then((r) => r.data),
  });

  const analytics = data?.analytics || {};

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 8 }}>📈 Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-powered insights into your recruitment pipeline</p>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Jobs', value: analytics.totalJobs ?? '—', icon: '📋', color: 'var(--accent-primary)' },
                { label: 'Total Applications', value: analytics.totalApplications ?? '—', icon: '📝', color: 'var(--accent-secondary)' },
                { label: 'Avg AI Score', value: analytics.avgScore ? `${analytics.avgScore.toFixed(1)}` : '—', icon: '🏆', color: 'var(--accent-success)' },
                { label: 'Shortlisted', value: analytics.totalShortlisted ?? '—', icon: '✅', color: 'var(--accent-warning)' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
              {/* Score Distribution */}
              {analytics.scoreDistribution && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20, fontSize: '1rem' }}>Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.scoreDistribution}>
                      <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="url(#purpleGrad)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Skills in Demand */}
              {analytics.topSkills && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20, fontSize: '1rem' }}>Top Skills in Demand</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analytics.topSkills.slice(0, 8).map(({ skill, count }, i) => (
                      <div key={skill}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{skill}</span>
                          <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>{count}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${(count / (analytics.topSkills[0]?.count || 1)) * 100}%`,
                            background: COLORS[i % COLORS.length],
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Over Time */}
              {analytics.applicationsOverTime && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20, fontSize: '1rem' }}>Applications Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.applicationsOverTime}>
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Application Status */}
              {analytics.statusBreakdown && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20, fontSize: '1rem' }}>Pipeline Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={analytics.statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count">
                          {analytics.statusBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analytics.statusBreakdown.map(({ status, count }, i) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{status}</span>
                          <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
