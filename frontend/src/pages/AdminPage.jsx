import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { adminAPI } from '../api/axios';
import { CATEGORY_ICONS, STATUS_OPTIONS } from '../utils/constants';
import {
  BarChart3, Users, FileText, TrendingUp, AlertTriangle,
  Search, Filter, Eye, Clock, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [tab, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'analytics') {
        const res = await adminAPI.getAnalytics();
        setAnalytics(res.data.analytics);
      } else {
        const res = await adminAPI.getComplaints({
          status: statusFilter || undefined,
          search: search || undefined,
          limit: 50,
        });
        setComplaints(res.data.complaints);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId, newStatus) => {
    try {
      await adminAPI.updateComplaint(complaintId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            <span className="gradient-text">Admin Panel</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Manage complaints and view analytics</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setTab('analytics')}
            className={`btn ${tab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '10px 20px' }}
          >
            <BarChart3 size={16} /> Analytics
          </button>
          <button
            onClick={() => setTab('complaints')}
            className={`btn ${tab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '10px 20px' }}
          >
            <FileText size={16} /> All Complaints
          </button>
        </div>

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
              </div>
            ) : analytics && (
              <>
                {/* Top Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <StatCard icon={<FileText size={22} />} label="Total Complaints" value={analytics.totalComplaints} color="#818cf8" bg="rgba(99,102,241,0.12)" />
                  <StatCard icon={<Users size={22} />} label="Total Users" value={analytics.totalUsers} color="#34d399" bg="rgba(16,185,129,0.12)" />
                  <StatCard
                    icon={<Clock size={22} />}
                    label="Pending"
                    value={analytics.statusStats?.find(s => s._id === 'pending')?.count || 0}
                    color="#f59e0b"
                    bg="rgba(245,158,11,0.12)"
                  />
                  <StatCard
                    icon={<CheckCircle size={22} />}
                    label="Resolved"
                    value={analytics.statusStats?.find(s => s._id === 'resolved')?.count || 0}
                    color="#34d399"
                    bg="rgba(16,185,129,0.12)"
                  />
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Status Distribution */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={16} style={{ color: '#818cf8' }} /> Status Distribution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.statusStats?.map((s, i) => {
                        const total = analytics.totalComplaints || 1;
                        const pct = Math.round((s.count / total) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span className={`badge badge-${s._id}`}>{s._id}</span>
                              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{s.count} ({pct}%)</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{
                                width: `${pct}%`, height: '100%', borderRadius: '3px',
                                background: STATUS_OPTIONS.find(o => o.value === s._id)?.color || '#818cf8',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} style={{ color: '#818cf8' }} /> Category Distribution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {analytics.categoryStats?.map((c, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            {CATEGORY_ICONS[c._id] || '📋'} {c._id}
                          </span>
                          <span style={{
                            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                            padding: '2px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                          }}>{c.count}</span>
                        </div>
                      ))}
                      {(!analytics.categoryStats || analytics.categoryStats.length === 0) && (
                        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Urgency & Sentiment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> Urgency Distribution
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {analytics.urgencyStats?.map((u, i) => (
                        <span key={i} className={`badge badge-${u._id}`} style={{ padding: '8px 16px', fontSize: '13px' }}>
                          {u._id}: {u.count}
                        </span>
                      ))}
                      {(!analytics.urgencyStats || analytics.urgencyStats.length === 0) && (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>No data yet</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} style={{ color: '#818cf8' }} /> Sentiment Analysis
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {analytics.sentimentStats?.map((s, i) => (
                        <span key={i} className={`badge badge-${s._id}`} style={{ padding: '8px 16px', fontSize: '13px' }}>
                          {s._id}: {s.count}
                        </span>
                      ))}
                      {(!analytics.sentimentStats || analytics.sentimentStats.length === 0) && (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>No data yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Complaints */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recent Complaints</h3>
                  {analytics.recentComplaints?.map((c, i) => (
                    <Link key={i} to={`/complaint/${c._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', borderRadius: '10px', textDecoration: 'none', color: 'inherit',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span>{CATEGORY_ICONS[c.category] || '📋'}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>{c.title}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{c.user?.name} • {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`badge badge-${c.status}`}>{c.status}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Complaints Tab */}
        {tab === 'complaints' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Search complaints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadData()}
                  id="admin-search"
                />
              </div>
              <select
                className="input-field"
                style={{ width: 'auto', minWidth: '140px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="admin-filter"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Complaints List */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: '70px' }} />)}
              </div>
            ) : complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No complaints found
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['User', 'Title', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '12px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '12px', fontWeight: '600', color: '#64748b',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <div style={{ fontWeight: '600' }}>{c.user?.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{c.user?.email}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '13px' }}>{CATEGORY_ICONS[c.category]} {c.category}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c._id, e.target.value)}
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <Link to={`/complaint/${c._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Eye size={14} /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: '800', color }}>{value}</p>
    </div>
  </div>
);

export default AdminPage;
