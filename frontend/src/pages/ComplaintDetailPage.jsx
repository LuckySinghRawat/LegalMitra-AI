import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { complaintsAPI, aiAPI } from '../api/axios';
import { CATEGORY_ICONS } from '../utils/constants';
import {
  ArrowLeft, Brain, Scale, Shield, AlertTriangle, Gauge, FileText,
  Download, Mail, Sparkles, CheckCircle, Clock, ChevronDown, ChevronUp,
  BookOpen, MapPin, Send, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      const res = await complaintsAPI.getById(id);
      setComplaint(res.data.complaint);
    } catch (error) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await aiAPI.analyze(complaint._id);
      setComplaint(res.data.complaint);
      toast.success('AI analysis complete! 🎉');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateLetter = async () => {
    setGeneratingLetter(true);
    try {
      const res = await aiAPI.generateLetter(complaint._id);
      setComplaint(prev => ({
        ...prev,
        aiAnalysis: { ...prev.aiAnalysis, formalLetter: res.data.letter }
      }));
      setShowLetter(true);
      toast.success('Letter generated! 📄');
    } catch (error) {
      toast.error('Letter generation failed');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const res = await complaintsAPI.downloadPDF(complaint._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaint-${complaint._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded! 📄', { id: 'pdf' });
    } catch (error) {
      toast.error('PDF generation failed', { id: 'pdf' });
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter recipient email');
      return;
    }
    setSendingEmail(true);
    try {
      await complaintsAPI.sendEmail(complaint._id, email);
      toast.success('Email sent successfully! 📧');
      setShowEmail(false);
      setEmail('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '200px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Complaint not found</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const analysis = complaint.aiAnalysis;
  const hasAnalysis = analysis && analysis.category;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Back button */}
        <Link to="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: '#94a3b8', textDecoration: 'none', fontSize: '14px', marginBottom: '24px',
          fontWeight: '500',
        }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        {/* Complaint Header */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(99,102,241,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', flexShrink: 0,
              }}>
                {CATEGORY_ICONS[complaint.category] || '📋'}
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>{complaint.title}</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`badge badge-${complaint.status}`}>{complaint.status}</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {complaint.description}
          </p>

          {complaint.location?.city && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
              <MapPin size={14} /> {complaint.location.city}{complaint.location.state ? `, ${complaint.location.state}` : ''}
            </p>
          )}
        </div>

        {/* AI Analysis Section */}
        {!hasAnalysis ? (
          <div className="glass-card" style={{
            padding: '40px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.03))',
          }}>
            <Brain size={48} style={{ color: '#818cf8', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>AI Analysis</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
              Run AI analysis to classify your complaint, detect urgency, and get smart legal suggestions.
            </p>
            <button onClick={handleAnalyze} disabled={analyzing}
              className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
              {analyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Analyzing...
                </span>
              ) : (
                <><Sparkles size={18} /> Analyze with AI</>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Analysis Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <MetricCard icon={<Brain size={20} />} label="Category" value={analysis.category} badge />
              <MetricCard icon={<AlertTriangle size={20} />} label="Sentiment" value={analysis.sentiment} badgeClass={`badge-${analysis.sentiment}`} />
              <MetricCard icon={<Gauge size={20} />} label="Urgency" value={analysis.urgency} badgeClass={`badge-${analysis.urgency}`} />
              <MetricCard icon={<Shield size={20} />} label="Confidence" value={`${analysis.confidenceScore}%`} isScore score={analysis.confidenceScore} />
            </div>

            {/* Validity */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} style={{ color: analysis.isReasonable ? '#34d399' : '#f87171' }} />
                Legal Validity: {analysis.isReasonable ? '✅ Reasonable' : '⚠️ May have issues'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{analysis.validityExplanation}</p>
            </div>

            {/* Suggested Actions */}
            {analysis.suggestedActions?.length > 0 && (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: '#818cf8' }} /> Suggested Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.suggestedActions.map((action, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '12px', padding: '12px 16px',
                      borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      alignItems: 'flex-start',
                    }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant Laws */}
            {analysis.relevantLaws?.length > 0 && (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} style={{ color: '#818cf8' }} /> Relevant Indian Laws
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysis.relevantLaws.map((law, i) => (
                    <div key={i} style={{
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(99,102,241,0.05)',
                      border: '1px solid rgba(99,102,241,0.1)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#818cf8' }}>{law.name}</h4>
                        {law.section && (
                          <span style={{
                            fontSize: '12px', padding: '2px 10px', borderRadius: '20px',
                            background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: '600',
                          }}>{law.section}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{law.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authority */}
            {analysis.suggestedAuthority && (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} style={{ color: '#818cf8' }} /> Suggested Authority
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{analysis.suggestedAuthority}</p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#818cf8' }} /> Actions
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button onClick={handleGenerateLetter} disabled={generatingLetter}
                  className="btn btn-primary" style={{ fontSize: '13px' }}>
                  {generatingLetter ? 'Generating...' : <><FileText size={16} /> Generate Letter</>}
                </button>
                {analysis.formalLetter && (
                  <>
                    <button onClick={() => setShowLetter(!showLetter)}
                      className="btn btn-secondary" style={{ fontSize: '13px' }}>
                      {showLetter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {showLetter ? 'Hide Letter' : 'View Letter'}
                    </button>
                    <button onClick={handleDownloadPDF}
                      className="btn btn-secondary" style={{ fontSize: '13px' }}>
                      <Download size={16} /> Download PDF
                    </button>
                    <button onClick={() => setShowEmail(true)}
                      className="btn btn-secondary" style={{ fontSize: '13px' }}>
                      <Mail size={16} /> Send Email
                    </button>
                  </>
                )}
                <button onClick={handleAnalyze} disabled={analyzing}
                  className="btn btn-secondary" style={{ fontSize: '13px' }}>
                  <Sparkles size={16} /> Re-analyze
                </button>
              </div>
            </div>

            {/* Letter Preview */}
            {showLetter && analysis.formalLetter && (
              <div className="glass-card animate-fadeIn" style={{ padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={18} style={{ color: '#818cf8' }} /> Formal Complaint Letter
                </h3>
                <div style={{
                  padding: '24px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'pre-wrap', fontFamily: 'serif',
                  fontSize: '14px', lineHeight: '1.8',
                  color: '#cbd5e1',
                }}>
                  {analysis.formalLetter}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email Modal */}
      {showEmail && (
        <div className="modal-overlay" onClick={() => setShowEmail(false)}>
          <div className="glass-card animate-fadeIn" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Send via Email</h3>
              <button onClick={() => setShowEmail(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <input
              type="email"
              className="input-field"
              placeholder="Recipient email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: '16px' }}
              id="email-recipient"
            />
            <button onClick={handleSendEmail} disabled={sendingEmail}
              className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              {sendingEmail ? 'Sending...' : <><Send size={16} /> Send Complaint Letter</>}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const MetricCard = ({ icon, label, value, badge, badgeClass, isScore, score }) => (
  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
    <div style={{ color: '#818cf8', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
    {isScore ? (
      <div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: score >= 70 ? '#34d399' : score >= 40 ? '#f59e0b' : '#f87171' }}>
          {value}
        </div>
        <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', marginTop: '8px' }}>
          <div style={{
            width: `${score}%`, height: '100%', borderRadius: '2px',
            background: score >= 70 ? '#34d399' : score >= 40 ? '#f59e0b' : '#f87171',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    ) : (
      <span className={`badge ${badgeClass || 'badge-analyzed'}`} style={{ fontSize: '14px', padding: '6px 16px', textTransform: 'capitalize' }}>
        {value}
      </span>
    )}
  </div>
);

export default ComplaintDetailPage;
