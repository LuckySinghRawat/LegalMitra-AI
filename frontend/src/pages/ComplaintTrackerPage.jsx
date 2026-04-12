import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { trackerAPI } from '../api/axios';
import { CATEGORY_ICONS } from '../utils/constants';
import {
  Bell, Zap, Archive, Calendar, Clock, ChevronDown, ChevronUp,
  Plus, Send, AlertTriangle, CheckCircle, Brain, FileText,
  MapPin, MessageSquare, CalendarClock, Timer, CircleDot
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Countdown Logic ─────────────────────────────────────
const getCountdown = (scheduledDate) => {
  if (!scheduledDate) return null;
  const now = new Date();
  const target = new Date(scheduledDate);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: '#1e1e1e', bg: 'rgba(239,68,68,0.9)', textColor: '#fff', urgent: true };
  if (diffDays === 0) return { label: 'Today', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', textColor: '#f87171', urgent: true };
  if (diffDays === 1) return { label: 'Tomorrow', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', textColor: '#fbbf24', urgent: true };
  if (diffDays <= 3) return { label: `In ${diffDays} days`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', textColor: '#fbbf24', urgent: false };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, color: '#34d399', bg: 'rgba(16,185,129,0.12)', textColor: '#34d399', urgent: false };
  return { label: `In ${diffDays} days`, color: '#64748b', bg: 'rgba(148,163,184,0.1)', textColor: '#94a3b8', urgent: false };
};

// ─── Timeline Icon Mapper ────────────────────────────────
const TimelineIcon = ({ type, status }) => {
  const size = 16;
  const styles = {
    created: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    status: { bg: status === 'resolved' ? 'rgba(16,185,129,0.15)' : status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: status === 'resolved' ? '#34d399' : status === 'rejected' ? '#f87171' : '#60a5fa' },
    ai: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    note: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    scheduled: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    letter: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  };
  const s = styles[type] || styles.created;
  const icons = {
    created: <Plus size={size} />,
    status: <CircleDot size={size} />,
    ai: <Brain size={size} />,
    note: <MessageSquare size={size} />,
    scheduled: <Calendar size={size} />,
    letter: <FileText size={size} />,
  };
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%',
      background: s.bg, color: s.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, zIndex: 1,
    }}>
      {icons[type] || <CircleDot size={size} />}
    </div>
  );
};

const ComplaintTrackerPage = () => {
  const [tab, setTab] = useState('upcoming');
  const [data, setData] = useState({ upcoming: [], active: [], past: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await trackerAPI.getGrouped();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load tracker data');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (id) => {
    try {
      setTimelineLoading(true);
      const res = await trackerAPI.getTimeline(id);
      setTimeline(res.data.timeline);
    } catch (err) {
      toast.error('Failed to load timeline');
    } finally {
      setTimelineLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setTimeline([]);
      setNoteText('');
      setScheduleDate('');
    } else {
      setExpandedId(id);
      setNoteText('');
      setScheduleDate('');
      await loadTimeline(id);
    }
  };

  const handleAddNote = async (id) => {
    if (!noteText.trim()) return;
    try {
      setActionLoading(true);
      await trackerAPI.addNote(id, noteText.trim());
      toast.success('Note added!');
      setNoteText('');
      await loadTimeline(id);
      await loadData();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetSchedule = async (id) => {
    if (!scheduleDate) return;
    try {
      setActionLoading(true);
      await trackerAPI.setSchedule(id, scheduleDate);
      toast.success('Hearing date set!');
      setScheduleDate('');
      await loadTimeline(id);
      await loadData();
    } catch (err) {
      toast.error('Failed to set schedule');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Hearings', icon: <Bell size={16} />, color: '#fbbf24', count: data.counts.upcoming },
    { id: 'active', label: 'Active', icon: <Zap size={16} />, color: '#818cf8', count: data.counts.active },
    { id: 'past', label: 'Past', icon: <Archive size={16} />, color: '#64748b', count: data.counts.past },
  ];

  const currentList = data[tab] || [];
  const upcomingUrgentCount = data.upcoming?.filter(c => {
    const cd = getCountdown(c.scheduledDate);
    return cd && cd.urgent;
  }).length || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
            <span className="gradient-text">Complaint Tracker</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Track hearings, deadlines, and the full lifecycle of your complaints.
          </p>
        </div>

        {/* ═══ Reminder Banner ═══ */}
        {data.counts.upcoming > 0 && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))',
            border: '1px solid rgba(245,158,11,0.25)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animation: 'fadeIn 0.5s ease',
          }} id="reminder-banner">
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse-glow 2s infinite',
            }}>
              <AlertTriangle size={22} style={{ color: '#fbbf24' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#fbbf24', marginBottom: '2px' }}>
                ⚠️ {data.counts.upcoming} hearing{data.counts.upcoming > 1 ? 's' : ''} coming up
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                {upcomingUrgentCount > 0 ? `${upcomingUrgentCount} need immediate attention` : 'Within the next 7 days'}
              </p>
            </div>
            <button onClick={() => setTab('upcoming')} className="btn btn-secondary" style={{
              padding: '8px 16px', fontSize: '12px', borderColor: 'rgba(245,158,11,0.3)',
            }}>
              View All
            </button>
          </div>
        )}

        {/* ═══ Tab Bar ═══ */}
        <div style={{
          display: 'flex', gap: '6px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
          padding: '6px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === t.id ? t.color : '#64748b',
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
              id={`tab-${t.id}`}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span style={{
                  background: tab === t.id ? t.color : 'rgba(255,255,255,0.1)',
                  color: tab === t.id ? '#0f0f23' : '#94a3b8',
                  padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  minWidth: '22px', textAlign: 'center',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ Content ═══ */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '14px' }} />)}
          </div>
        ) : currentList.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            {tab === 'upcoming' ? <Bell size={48} style={{ color: '#334155', marginBottom: '16px' }} /> :
             tab === 'active' ? <Zap size={48} style={{ color: '#334155', marginBottom: '16px' }} /> :
             <Archive size={48} style={{ color: '#334155', marginBottom: '16px' }} />}
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '8px' }}>
              {tab === 'upcoming' ? 'No upcoming hearings' :
               tab === 'active' ? 'No active complaints' : 'No past complaints'}
            </p>
            <p style={{ color: '#475569', fontSize: '13px' }}>
              {tab === 'upcoming' ? 'Set hearing dates on your active complaints to see them here.' :
               tab === 'active' ? 'Submit a new complaint to get started.' :
               'Resolved and rejected complaints will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentList.map(complaint => {
              const countdown = getCountdown(complaint.scheduledDate);
              const isExpanded = expandedId === complaint._id;

              return (
                <div key={complaint._id} className="glass-card" style={{
                  padding: 0, overflow: 'hidden',
                  borderColor: isExpanded ? 'rgba(99,102,241,0.3)' : undefined,
                }}>
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(complaint._id)}
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Category icon */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0,
                    }}>
                      {CATEGORY_ICONS[complaint.category] || '📋'}
                    </div>

                    {/* Title and meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '15px', fontWeight: '600', marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {complaint.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${complaint.status}`}>{complaint.status}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {complaint.notes?.length > 0 && (
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={11} /> {complaint.notes.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Countdown chip */}
                    {countdown && (
                      <div style={{
                        padding: '6px 14px', borderRadius: '20px',
                        background: countdown.bg, color: countdown.textColor,
                        fontSize: '12px', fontWeight: '700', flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        border: countdown.urgent ? `1px solid ${countdown.color}33` : 'none',
                      }}>
                        <Timer size={13} />
                        {countdown.label}
                      </div>
                    )}

                    {/* Expand toggle */}
                    <div style={{ color: '#64748b', flexShrink: 0 }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* ═══ Expanded Section ═══ */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '20px',
                      animation: 'fadeIn 0.3s ease',
                    }}>
                      {/* Quick link to full detail */}
                      <div style={{ marginBottom: '20px' }}>
                        <Link to={`/complaint/${complaint._id}`} style={{
                          fontSize: '12px', color: '#818cf8', textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}>
                          View full complaint details →
                        </Link>
                      </div>

                      {/* ─── Visual Timeline ─── */}
                      <h5 style={{
                        fontSize: '13px', fontWeight: '700', color: '#e2e8f0',
                        marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <Clock size={14} style={{ color: '#818cf8' }} /> Timeline
                      </h5>

                      {timelineLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />)}
                        </div>
                      ) : (
                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                          {/* Vertical line */}
                          <div style={{
                            position: 'absolute', left: '15px', top: '16px',
                            bottom: '16px', width: '2px',
                            background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), rgba(99,102,241,0.05))',
                            borderRadius: '1px',
                          }} />

                          {timeline.map((event, idx) => (
                            <div key={idx} style={{
                              display: 'flex', gap: '14px', marginBottom: idx === timeline.length - 1 ? 0 : '16px',
                              position: 'relative',
                            }}>
                              <TimelineIcon type={event.type} status={event.status} />
                              <div style={{ flex: 1, paddingTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                                    {event.label}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    {new Date(event.date).toLocaleDateString('en-IN', {
                                      day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                    {' · '}
                                    {new Date(event.date).toLocaleTimeString('en-IN', {
                                      hour: '2-digit', minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {event.description && (
                                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', lineHeight: '1.5' }}>
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ─── Action Forms ─── */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '20px',
                      }}>
                        {/* Add Note */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MessageSquare size={13} /> Add Timeline Note
                          </label>
                          <textarea
                            className="input-field"
                            style={{ minHeight: '70px', resize: 'vertical', fontSize: '13px' }}
                            placeholder="E.g., Called the authority, visited court..."
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            maxLength={500}
                            id={`note-input-${complaint._id}`}
                          />
                          <button
                            onClick={() => handleAddNote(complaint._id)}
                            disabled={!noteText.trim() || actionLoading}
                            className="btn btn-primary"
                            style={{ marginTop: '8px', padding: '8px 16px', fontSize: '12px', width: '100%' }}
                            id={`add-note-${complaint._id}`}
                          >
                            <Send size={13} /> Add Note
                          </button>
                        </div>

                        {/* Set Schedule */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarClock size={13} /> Set Hearing / Deadline
                          </label>
                          <input
                            type="date"
                            className="input-field"
                            style={{ fontSize: '13px' }}
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            id={`schedule-input-${complaint._id}`}
                          />
                          {complaint.scheduledDate && (
                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                              Current: {new Date(complaint.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          )}
                          <button
                            onClick={() => handleSetSchedule(complaint._id)}
                            disabled={!scheduleDate || actionLoading}
                            className="btn btn-secondary"
                            style={{
                              marginTop: '8px', padding: '8px 16px', fontSize: '12px', width: '100%',
                              borderColor: 'rgba(16,185,129,0.3)', color: '#34d399',
                            }}
                            id={`set-schedule-${complaint._id}`}
                          >
                            <Calendar size={13} /> Set Date
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintTrackerPage;
