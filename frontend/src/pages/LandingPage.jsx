import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { Shield, Brain, FileText, Mic, Globe, MapPin, ArrowRight, Sparkles, Scale, CheckCircle } from 'lucide-react';

const features = [
  { icon: <Brain size={28} />, title: 'AI-Powered Analysis', desc: 'Get instant classification, sentiment analysis, urgency detection, and validity check for your complaints.' },
  { icon: <Scale size={28} />, title: 'Indian Law References', desc: 'Automatically find relevant Indian laws, acts, and sections applicable to your complaint.' },
  { icon: <FileText size={28} />, title: 'Auto-Generated Letters', desc: 'Generate professional formal complaint letters ready to submit to authorities.' },
  { icon: <Mic size={28} />, title: 'Voice Input', desc: 'Dictate your complaint in Hindi or English using voice-to-text technology.' },
  { icon: <Globe size={28} />, title: 'Multilingual Support', desc: 'Full support for Hindi and English — submit and receive analysis in your preferred language.' },
  { icon: <MapPin size={28} />, title: 'Location-Based Suggestions', desc: 'Get authority and jurisdiction suggestions based on your geographic location.' },
];

const steps = [
  { num: '01', title: 'Submit Your Complaint', desc: 'Type or speak your complaint in Hindi or English. Select a category or let AI detect it.' },
  { num: '02', title: 'AI Analyzes Instantly', desc: 'Our AI classifies your complaint, detects urgency & sentiment, and validates legal standing.' },
  { num: '03', title: 'Get Smart Suggestions', desc: 'Receive relevant laws, next actions, authority recommendations, and a formal complaint letter.' },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 100px',
        textAlign: 'center',
      }}>
        {/* Background Gradient Orbs */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '50px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: '32px',
            fontSize: '13px',
            color: '#818cf8',
            fontWeight: '600',
          }}>
            <Sparkles size={14} /> AI-Powered Legal Platform for India
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '24px',
            letterSpacing: '-1px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Smart Complaint
            </span>
            <br />
            <span className="gradient-text">AI Platform</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.7',
          }}>
            Submit your complaints, get instant AI analysis with relevant Indian laws,
            and generate formal complaint letters — all in one platform.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '700' }}
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="btn btn-secondary"
              style={{ padding: '14px 32px', fontSize: '16px' }}
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            marginTop: '60px',
            flexWrap: 'wrap',
          }}>
            {[
              { num: '12+', label: 'Complaint Categories' },
              { num: '50+', label: 'Indian Laws Referenced' },
              { num: '2', label: 'Languages Supported' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800' }} className="gradient-text">{stat.num}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            Everything you need to handle legal complaints intelligently.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                marginBottom: '16px',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((s, i) => (
            <div key={i} className="glass-card" style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                minWidth: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '800',
                color: 'white',
              }}>
                {s.num}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div className="glass-card" style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '48px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
        }}>
          <Shield size={48} style={{ color: '#818cf8', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>
            Join LegalMitra AI and let technology empower your legal rights.
          </p>
          <Link
            to={isAuthenticated ? '/dashboard' : '/signup'}
            className="btn btn-primary"
            style={{ padding: '14px 40px', fontSize: '16px', fontWeight: '700' }}
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '13px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Scale size={16} style={{ color: '#818cf8' }} />
          <span style={{ fontWeight: '600', color: '#94a3b8' }}>LegalMitra AI</span>
        </div>
        © {new Date().getFullYear()} LegalMitra AI Platform. Built for India 🇮🇳
      </footer>
    </div>
  );
};

export default LandingPage;
