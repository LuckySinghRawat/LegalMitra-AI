import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { complaintsAPI, aiAPI } from '../api/axios';
import { CATEGORIES, CATEGORY_ICONS, INDIAN_STATES } from '../utils/constants';
import { Mic, MicOff, MapPin, Send, Sparkles, ChevronDown, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitComplaintPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    language: user?.language || 'en',
    location: { city: '', state: '' }
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(1);
  const recognitionRef = useRef(null);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            location: {
              city: data.address?.city || data.address?.town || data.address?.village || '',
              state: data.address?.state || '',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }
          }));
        } catch (err) {
          console.log('Geocoding failed:', err);
        }
      }, () => {}, { timeout: 5000 });
    }
  }, []);

  // Voice to Text
  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser. Try Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = form.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setForm(prev => ({
          ...prev,
          description: prev.description + (prev.description ? ' ' : '') + finalTranscript
        }));
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsRecording(false);
      toast.error('Voice input error. Please try again.');
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success(form.language === 'hi' ? 'बोलना शुरू करें...' : 'Start speaking...');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create complaint
      const res = await complaintsAPI.create(form);
      const complaint = res.data.complaint;
      toast.success('Complaint submitted! Analyzing with AI...');

      // Step 2: Analyze with AI
      setAnalyzing(true);
      try {
        await aiAPI.analyze(complaint._id);
        toast.success('AI analysis complete! 🎉');
      } catch (aiErr) {
        toast.error('AI analysis delayed. You can retry from the complaint page.');
      }

      navigate(`/complaint/${complaint._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            <span className="gradient-text">Submit Complaint</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Describe your issue and let AI analyze it with relevant Indian laws.
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {['Details', 'Category & Location', 'Review & Submit'].map((label, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: '4px',
                borderRadius: '2px',
                background: step > i ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s',
                marginBottom: '8px',
              }} />
              <span style={{
                fontSize: '12px',
                color: step > i ? '#818cf8' : '#64748b',
                fontWeight: step === i + 1 ? '600' : '400',
              }}>{label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="glass-card animate-fadeIn" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Complaint Title</label>
                </div>
                <input
                  name="title"
                  className="input-field"
                  placeholder="Brief title of your complaint"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                  id="complaint-title"
                />
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  {form.title.length}/200
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Description</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setForm(f => ({ ...f, language: f.language === 'en' ? 'hi' : 'en' }))}
                      className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Globe size={13} /> {form.language === 'en' ? 'हिंदी' : 'English'}
                    </button>
                    <button type="button" onClick={toggleRecording}
                      className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {isRecording ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Voice</>}
                    </button>
                  </div>
                </div>
                <textarea
                  name="description"
                  className="input-field"
                  style={{ minHeight: '180px', resize: 'vertical', lineHeight: '1.6' }}
                  placeholder={form.language === 'hi'
                    ? 'अपनी शिकायत यहाँ विस्तार से लिखें... आप आवाज़ बटन भी उपयोग कर सकते हैं।'
                    : 'Describe your complaint in detail... You can also use the voice button.'
                  }
                  value={form.description}
                  onChange={handleChange}
                  maxLength={5000}
                  id="complaint-description"
                />
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  {form.description.length}/5000
                </span>
              </div>

              {isRecording && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#f87171',
                }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#ef4444', animation: 'pulse-glow 1s infinite',
                  }} />
                  🎙️ {form.language === 'hi' ? 'रिकॉर्डिंग जारी है... बोलते रहें' : 'Recording... Keep speaking'}
                </div>
              )}

              <button type="button" onClick={() => {
                if (!form.title || !form.description) {
                  toast.error('Please fill in title and description');
                  return;
                }
                setStep(2);
              }}
                className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                Continue to Category
              </button>
            </div>
          )}

          {/* Step 2: Category & Location */}
          {step === 2 && (
            <div className="glass-card animate-fadeIn" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px', display: 'block' }}>
                  Category
                </label>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Leave empty for AI auto-detection
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: form.category === cat ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                        background: form.category === cat ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                        color: form.category === cat ? '#818cf8' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: '#818cf8' }} /> Location
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    className="input-field"
                    placeholder="City"
                    value={form.location.city}
                    onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))}
                    id="complaint-city"
                  />
                  <select
                    className="input-field"
                    value={form.location.state}
                    onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, state: e.target.value } }))}
                    id="complaint-state"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {form.location.city && (
                  <p style={{ fontSize: '12px', color: '#34d399', marginTop: '6px' }}>
                    📍 Location detected: {form.location.city}{form.location.state ? `, ${form.location.state}` : ''}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(1)}
                  className="btn btn-secondary" style={{ flex: 1, padding: '14px' }}>
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)}
                  className="btn btn-primary" style={{ flex: 2, padding: '14px' }}>
                  Review Complaint
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="glass-card animate-fadeIn" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Review Your Complaint</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                <ReviewField label="Title" value={form.title} />
                <ReviewField label="Description" value={form.description} long />
                <ReviewField label="Category" value={form.category ? `${CATEGORY_ICONS[form.category]} ${form.category}` : '🤖 Auto-detect with AI'} />
                <ReviewField label="Language" value={form.language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'} />
                <ReviewField label="Location" value={
                  form.location.city || form.location.state
                    ? `📍 ${form.location.city}${form.location.state ? `, ${form.location.state}` : ''}`
                    : 'Not specified'
                } />
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <Sparkles size={20} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                  After submission, AI will automatically <strong style={{ color: '#818cf8' }}>analyze your complaint</strong> — classify it, detect sentiment & urgency, check legal validity, and suggest relevant Indian laws and next steps.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)}
                  className="btn btn-secondary" style={{ flex: 1, padding: '14px' }}>
                  Back
                </button>
                <button type="submit" disabled={loading || analyzing}
                  className="btn btn-primary" style={{ flex: 2, padding: '14px', fontSize: '15px' }}>
                  {loading || analyzing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      {analyzing ? 'AI Analyzing...' : 'Submitting...'}
                    </span>
                  ) : (
                    <><Send size={18} /> Submit & Analyze</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const ReviewField = ({ label, value, long }) => (
  <div style={{
    padding: '14px 16px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
  }}>
    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{
      fontSize: '14px',
      color: '#e2e8f0',
      lineHeight: '1.5',
      display: 'block',
      ...(long ? { whiteSpace: 'pre-wrap', maxHeight: '120px', overflow: 'auto' } : {})
    }}>{value}</span>
  </div>
);

export default SubmitComplaintPage;
