import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STRINGS } from '../../utils/constants';
import { trackerAPI } from '../../api/axios';
import { Menu, X, Globe, LogOut, LayoutDashboard, PlusCircle, Shield, Scale, CalendarClock } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState(user?.language || 'en');
  const navigate = useNavigate();
  const location = useLocation();
  const t = STRINGS[lang];
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      trackerAPI.getUpcomingCount()
        .then(res => setUpcomingCount(res.data.count))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(20px)',
      background: 'rgba(15, 15, 35, 0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}>
            <Scale size={20} color="white" />
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {t.appName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>
                <LayoutDashboard size={16} /> {t.dashboard}
              </NavLink>
              <NavLink to="/submit" active={isActive('/submit')}>
                <PlusCircle size={16} /> {t.submitComplaint}
              </NavLink>
              <NavLink to="/tracker" active={isActive('/tracker')}>
                <CalendarClock size={16} /> Tracker
                {upcomingCount > 0 && (
                  <span style={{
                    background: '#ef4444', color: 'white',
                    fontSize: '10px', fontWeight: '700',
                    padding: '1px 6px', borderRadius: '10px',
                    minWidth: '18px', textAlign: 'center',
                    lineHeight: '16px',
                  }}>{upcomingCount}</span>
                )}
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" active={isActive('/admin')}>
                  <Shield size={16} /> {t.adminPanel}
                </NavLink>
              )}
              <button onClick={toggleLang} style={{
                border: 'none',
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}>
                <Globe size={15} /> {lang === 'en' ? 'हिंदी' : 'EN'}
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '8px',
                paddingLeft: '16px',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                  {user?.name}
                </span>
                <button onClick={handleLogout} style={{
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                {t.login}
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                {t.signup}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            border: 'none',
            background: 'none',
            color: '#f1f5f9',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <LayoutDashboard size={16} /> {t.dashboard}
              </Link>
              <Link to="/submit" onClick={() => setMobileOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <PlusCircle size={16} /> {t.submitComplaint}
              </Link>
              <Link to="/tracker" onClick={() => setMobileOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', position: 'relative' }}>
                <CalendarClock size={16} /> Tracker
                {upcomingCount > 0 && (
                  <span style={{
                    background: '#ef4444', color: 'white',
                    fontSize: '10px', fontWeight: '700',
                    padding: '1px 6px', borderRadius: '10px',
                    marginLeft: '4px',
                  }}>{upcomingCount}</span>
                )}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
                <LogOut size={16} /> {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary">{t.login}</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn btn-primary">{t.signup}</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    color: active ? '#818cf8' : '#94a3b8',
    background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
  }}>
    {children}
  </Link>
);

export default Navbar;
