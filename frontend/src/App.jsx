import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AdminPage from './pages/AdminPage';
import FindAdvocatePage from './pages/FindAdvocatePage';
import ComplaintTrackerPage from './pages/ComplaintTrackerPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <div>

      {/* ✅ Your existing routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/submit" element={
          <ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>
        } />
        <Route path="/complaint/:id" element={
          <ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>
        } />
        <Route path="/find-advocate" element={
          <ProtectedRoute><FindAdvocatePage /></ProtectedRoute>
        } />
        <Route path="/tracker" element={
          <ProtectedRoute><ComplaintTrackerPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AdminRoute><AdminPage /></AdminRoute></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ✅ ADD THIS EXACTLY HERE (outside Routes) */}
      <a
        href="https://wa.me/+14155238886?text=Hello%20LegalMitra%2C%20I%20need%20help%20with%20a%20legal%20complaint"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with LegalMitra AI Assistant"
      >
        <img
          src="https://img.icons8.com/color/48/000000/whatsapp.png"
          alt="chat"
          width="35"
        />
        <span className="whatsapp-tooltip">AI Chatbot Available</span>
      </a>

    </div>
  );
}

export default App;
