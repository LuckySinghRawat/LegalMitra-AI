import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { complaintsAPI } from '../api/axios';
import { CATEGORY_ICONS, STATUS_OPTIONS } from '../utils/constants';
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes] = await Promise.all([
        complaintsAPI.getAll({ status: filter || undefined, limit: 20 }),
        complaintsAPI.getStats(),
      ]);
      setComplaints(complaintsRes.data.complaints);
      setStats(statsRes.data.stats);
      setCategoryStats(statsRes.data.categoryStats || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total', value: stats?.total || 0, icon: <FileText size={22} />, color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Pending', value: stats?.pending || 0, icon: <Clock size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Analyzed', value: stats?.analyzed || 0, icon: <BarChart3 size={22} />, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: <CheckCircle size={22} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Track and manage your complaints</p>
          </div>
          <Link to="/submit" className="btn btn-primary" style={{ fontSize: '14px' }}>
            <PlusCircle size={18} /> New Complaint
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {statCards.map((card, i) => (
            <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{card.label}</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: card.color }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Distribution */}
        {categoryStats.length > 0 && (
          <div className="glass-card" style={{ marginBottom: '32px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: '#818cf8' }} /> Complaint Categories
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {categoryStats.map((cat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '13px',
                }}>
                  <span>{CATEGORY_ICONS[cat._id] || '📋'}</span>
                  <span style={{ fontWeight: '600' }}>{cat._id}</span>
                  <span style={{
                    background: 'rgba(99,102,241,0.15)',
                    color: '#818cf8',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + Complaints List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#818cf8' }} /> My Complaints
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} style={{ color: '#64748b' }} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '13px', width: 'auto', minWidth: '140px' }}
                id="dashboard-filter"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={48} style={{ color: '#334155', marginBottom: '16px' }} />
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '20px' }}>No complaints found</p>
              <Link to="/submit" className="btn btn-primary" style={{ fontSize: '14px' }}>
                <PlusCircle size={16} /> Submit Your First Complaint
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {complaints.map((c) => (
                <Link
                  key={c._id}
                  to={`/complaint/${c._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[c.category] || '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description?.substring(0, 100)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <span className={`badge badge-${c.status}`}>
                      {c.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
