import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { complaintsAPI, aiAPI } from '../api/axios';
import { CATEGORIES, CATEGORY_ICONS, INDIAN_STATES } from '../utils/constants';
import {
  Mic, MicOff, MapPin, Send, Sparkles, Globe,
  Paperclip, X, FileText, Image as ImageIcon, File,
  Type, Upload, Mic2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const INPUT_MODES = [
  {
    id: 'text',
    icon: <Type size={28} />,
    label: 'Text',
    desc: 'Type your complaint in detail',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    bg: 'rgba(99,102,241,0.10)',
    border: 'rgba(99,102,241,0.3)',
  },
  {
    id: 'file',
    icon: <Upload size={28} />,
    label: 'File Upload',
    desc: 'Upload PDF, images or documents',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'voice',
    icon: <Mic2 size={28} />,
    label: 'Voice',
    desc: 'Speak your complaint aloud',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.3)',
  },
];

const SubmitComplaintPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState(null); // 'text' | 'file' | 'voice' | null
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    language: user?.language || 'en',
    location: { city: '', state: '' }
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(0); // 0=mode select, 1=input, 2=category, 3=review
  const [dragActive, setDragActive] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // ─── Voice Recording ───────────────────────────────────
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

  // ─── File Handling ─────────────────────────────────────
  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`"${file.name}" — type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`"${file.name}" exceeds 10 MB limit.`);
      return false;
    }
    return true;
  };

  const addFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const toAdd = fileArray.slice(0, remaining).filter(validateFile);
    if (fileArray.length > remaining) {
      toast.error(`Only ${remaining} more file(s) allowed. Some were skipped.`);
    }
    setFiles(prev => [...prev, ...toAdd]);
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const getFileIcon = (file) => {
    const ext = (typeof file === 'string' ? file : file.name).split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon size={18} />;
    if (ext === 'pdf') return <FileText size={18} />;
    return <File size={18} />;
  };

  const getFilePreview = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return URL.createObjectURL(file);
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ─── Mode Selection ────────────────────────────────────
  const selectMode = (mode) => {
    setInputMode(mode);
    // Reset input-specific state
    setForm(prev => ({ ...prev, description: '' }));
    setFiles([]);
    setIsRecording(false);
    setStep(1);
  };

  // ─── Validation for Step 1 → 2 ────────────────────────
  const canProceedFromInput = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a complaint title');
      return false;
    }
    if (inputMode === 'text' && !form.description.trim()) {
      toast.error('Please describe your complaint');
      return false;
    }
    if (inputMode === 'file' && files.length === 0) {
      toast.error('Please upload at least one file');
      return false;
    }
    if (inputMode === 'voice' && !form.description.trim()) {
      toast.error('Please record your complaint using the microphone');
      return false;
    }
    return true;
  };

  // ─── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (inputMode === 'file') {
        payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description || `Complaint submitted via file upload. ${files.length} file(s) attached.`);
        payload.append('category', form.category || 'Other');
        payload.append('language', form.language);
        payload.append('location', JSON.stringify(form.location));
        files.forEach(file => payload.append('attachments', file));
      } else {
        payload = form;
      }

      const res = await complaintsAPI.create(payload);
      const complaint = res.data.complaint;
      toast.success('Complaint submitted! Analyzing with AI...');

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

  // ─── Step labels (dynamic based on flow) ───────────────
  const stepLabels = ['Choose Method', 'Complaint Details', 'Category & Location', 'Review & Submit'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            <span className="gradient-text">Submit Complaint</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Choose how you'd like to submit your complaint, then let AI analyze it.
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: '4px', borderRadius: '2px',
                background: step > i ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s', marginBottom: '8px',
              }} />
              <span style={{
                fontSize: '11px',
                color: step > i ? '#818cf8' : step === i ? '#e2e8f0' : '#64748b',
                fontWeight: step === i ? '600' : '400',
              }}>{label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ═══ Step 0: Choose Input Mode ═══ */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' }}>
                How would you like to submit?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {INPUT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => selectMode(mode.id)}
                    style={{
                      padding: '32px 20px',
                      borderRadius: '16px',
                      border: `2px solid transparent`,
                      background: mode.bg,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '14px',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = mode.border;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 30px ${mode.border}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    id={`mode-${mode.id}`}
                  >
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '16px',
                      background: mode.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                    }}>
                      {mode.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', marginBottom: '4px' }}>{mode.label}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>{mode.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Step 1: Input based on mode ═══ */}
          {step === 1 && (
            <div className="glass-card animate-fadeIn" style={{ padding: '32px' }}>
              {/* Mode indicator */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '20px', marginBottom: '24px',
                background: INPUT_MODES.find(m => m.id === inputMode)?.bg,
                fontSize: '12px', fontWeight: '600',
                color: inputMode === 'text' ? '#818cf8' : inputMode === 'file' ? '#fbbf24' : '#34d399',
              }}>
                {INPUT_MODES.find(m => m.id === inputMode)?.icon && (
                  inputMode === 'text' ? <Type size={14} /> : inputMode === 'file' ? <Upload size={14} /> : <Mic2 size={14} />
                )}
                {INPUT_MODES.find(m => m.id === inputMode)?.label} Mode
              </div>

              {/* Title — common to all modes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px', display: 'block' }}>
                  Complaint Title
                </label>
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

              {/* Language selector — common */}
              <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, language: f.language === 'en' ? 'hi' : 'en' }))}
                  className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  <Globe size={13} /> {form.language === 'en' ? 'हिंदी' : 'English'}
                </button>
              </div>

              {/* ─── TEXT MODE ─── */}
              {inputMode === 'text' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px', display: 'block' }}>
                    Describe Your Complaint
                  </label>
                  <textarea
                    name="description"
                    className="input-field"
                    style={{ minHeight: '200px', resize: 'vertical', lineHeight: '1.6' }}
                    placeholder={form.language === 'hi'
                      ? 'अपनी शिकायत यहाँ विस्तार से लिखें...'
                      : 'Describe your complaint in detail...'
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
              )}

              {/* ─── FILE MODE ─── */}
              {inputMode === 'file' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} style={{ color: '#fbbf24' }} /> Upload Complaint Files
                  </label>

                  {/* Drag & Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragActive ? '#fbbf24' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '14px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: dragActive ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                      marginBottom: files.length > 0 ? '16px' : '0',
                    }}
                    id="file-dropzone"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ALLOWED_EXTENSIONS.join(',')}
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <Upload size={36} style={{ color: dragActive ? '#fbbf24' : '#64748b', marginBottom: '12px' }} />
                    <p style={{ color: dragActive ? '#fbbf24' : '#e2e8f0', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                      {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>
                      PDF, JPEG, PNG, DOC, DOCX — Max 10 MB each, up to {MAX_FILES} files
                    </p>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {files.map((file, index) => {
                        const preview = getFilePreview(file);
                        return (
                          <div key={index} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                            {preview ? (
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                overflow: 'hidden', flexShrink: 0,
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}>
                                <img src={preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                background: 'rgba(245,158,11,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fbbf24', flexShrink: 0,
                              }}>
                                {getFileIcon(file)}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: '13px', fontWeight: '500', color: '#e2e8f0',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{file.name}</p>
                              <p style={{ fontSize: '11px', color: '#64748b' }}>{formatFileSize(file.size)}</p>
                            </div>
                            <button type="button" onClick={() => removeFile(index)} style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: '8px', width: '32px', height: '32px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: '#f87171', flexShrink: 0,
                            }} id={`remove-file-${index}`}>
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                      <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                        {files.length}/{MAX_FILES} files
                      </p>
                    </div>
                  )}

                  {/* Optional description for file mode */}
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                      Additional notes (optional)
                    </label>
                    <textarea
                      name="description"
                      className="input-field"
                      style={{ minHeight: '80px', resize: 'vertical', lineHeight: '1.6' }}
                      placeholder="Add any extra details about the uploaded files..."
                      value={form.description}
                      onChange={handleChange}
                      maxLength={5000}
                      id="complaint-description-file"
                    />
                  </div>
                </div>
              )}

              {/* ─── VOICE MODE ─── */}
              {inputMode === 'voice' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', display: 'block' }}>
                    Speak Your Complaint
                  </label>

                  {/* Big mic button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <button
                      type="button"
                      onClick={toggleRecording}
                      style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        border: isRecording ? '3px solid #ef4444' : '3px solid rgba(16,185,129,0.4)',
                        background: isRecording
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: isRecording
                          ? '0 0 30px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.2)'
                          : '0 8px 25px rgba(16,185,129,0.3)',
                        animation: isRecording ? 'pulse-glow 1.5s infinite' : 'none',
                      }}
                      id="voice-record-btn"
                    >
                      {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
                    </button>
                    <p style={{
                      marginTop: '16px', fontSize: '14px', fontWeight: '600',
                      color: isRecording ? '#f87171' : '#34d399',
                    }}>
                      {isRecording
                        ? (form.language === 'hi' ? '🎙️ रिकॉर्डिंग जारी है... बोलते रहें' : '🎙️ Recording... Keep speaking')
                        : (form.language === 'hi' ? 'माइक बटन दबाकर बोलें' : 'Tap the mic to start speaking')
                      }
                    </p>
                    {isRecording && (
                      <div style={{
                        display: 'flex', gap: '4px', marginTop: '12px', alignItems: 'flex-end', height: '20px',
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} style={{
                            width: '4px', borderRadius: '2px',
                            background: '#ef4444',
                            animation: `voiceBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transcription output */}
                  {form.description && (
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                        Transcribed Text:
                      </label>
                      <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        minHeight: '100px', maxHeight: '200px', overflowY: 'auto',
                      }}>
                        <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                          {form.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {form.description.length}/5000
                        </span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, description: '' }))}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '12px', color: '#f87171', fontFamily: 'Inter, sans-serif', fontWeight: '500',
                          }}>
                          Clear transcript
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { setStep(0); setInputMode(null); }}
                  className="btn btn-secondary" style={{ flex: 1, padding: '14px' }}>
                  Back
                </button>
                <button type="button" onClick={() => { if (canProceedFromInput()) setStep(2); }}
                  className="btn btn-primary" style={{ flex: 2, padding: '14px' }}>
                  Continue to Category
                </button>
              </div>
            </div>
          )}

          {/* ═══ Step 2: Category & Location ═══ */}
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
                        padding: '12px', borderRadius: '12px',
                        border: form.category === cat ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                        background: form.category === cat ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                        color: form.category === cat ? '#818cf8' : '#94a3b8',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                      }}
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4e6480ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <option value="" style={{ background: '#334155', color: '#ffffff' }}>Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#334155', color: '#ffffff' }}>{s}</option>)}
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

          {/* ═══ Step 3: Review & Submit ═══ */}
          {step === 3 && (
            <div className="glass-card animate-fadeIn" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Review Your Complaint</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {/* Input mode badge */}
                <div style={{
                  padding: '14px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Submission Method</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                    background: INPUT_MODES.find(m => m.id === inputMode)?.bg,
                    color: inputMode === 'text' ? '#818cf8' : inputMode === 'file' ? '#fbbf24' : '#34d399',
                  }}>
                    {inputMode === 'text' ? <Type size={14} /> : inputMode === 'file' ? <Upload size={14} /> : <Mic2 size={14} />}
                    {INPUT_MODES.find(m => m.id === inputMode)?.label}
                  </span>
                </div>

                <ReviewField label="Title" value={form.title} />

                {/* Description — only show if present */}
                {form.description && (
                  <ReviewField label={inputMode === 'voice' ? 'Transcribed Text' : 'Description'} value={form.description} long />
                )}

                {/* Files — only for file mode */}
                {inputMode === 'file' && files.length > 0 && (
                  <div style={{
                    padding: '14px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
                      Uploaded Files ({files.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {files.map((file, i) => {
                        const preview = getFilePreview(file);
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 12px', borderRadius: '8px',
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                            fontSize: '12px', color: '#fbbf24',
                          }}>
                            {preview ? (
                              <img src={preview} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                            ) : getFileIcon(file)}
                            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file.name}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '10px' }}>{formatFileSize(file.size)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ReviewField label="Category" value={form.category ? `${CATEGORY_ICONS[form.category]} ${form.category}` : '🤖 Auto-detect with AI'} />
                <ReviewField label="Language" value={form.language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'} />
                <ReviewField label="Location" value={
                  form.location.city || form.location.state
                    ? `📍 ${form.location.city}${form.location.state ? `, ${form.location.state}` : ''}`
                    : 'Not specified'
                } />
              </div>

              <div style={{
                padding: '16px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <Sparkles size={20} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#2068cdff', lineHeight: '1.6' }}>
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
        @keyframes voiceBar {
          0% { height: 4px; }
          100% { height: 20px; }
        }
      `}</style>
    </div>
  );
};

const ReviewField = ({ label, value, long }) => (
  <div style={{
    padding: '14px 16px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
  }}>
    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{
      fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5', display: 'block',
      ...(long ? { whiteSpace: 'pre-wrap', maxHeight: '120px', overflow: 'auto' } : {})
    }}>{value}</span>
  </div>
);

export default SubmitComplaintPage;
