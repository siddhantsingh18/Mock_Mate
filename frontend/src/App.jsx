import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StartInterview from './pages/StartInterview';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="animate-spin" style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--accent)', borderRadius:'50%', margin:'0 auto 16px' }} />
        <p style={{ color:'var(--text-muted)', fontFamily:'var(--font-body)' }}>Loading MockMate...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style:{ background:'var(--bg-elevated)', color:'var(--text)', border:'1px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'14px' }, success:{ iconTheme:{ primary:'var(--success)', secondary:'var(--bg)' } }, error:{ iconTheme:{ primary:'var(--danger)', secondary:'var(--bg)' } }, duration:3000 }} />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/start" element={<PrivateRoute><Layout><StartInterview /></Layout></PrivateRoute>} />
          <Route path="/interview/:sessionId" element={<PrivateRoute><InterviewSession /></PrivateRoute>} />
          <Route path="/report/:sessionId" element={<PrivateRoute><Layout><InterviewReport /></Layout></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><Layout><History /></Layout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
