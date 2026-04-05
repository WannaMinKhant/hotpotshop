import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useToastStore } from './stores/toastStore';
import { useThemeStore } from './stores/themeStore';
import ToastContainer from './Components/ToastContainer';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-gray-400">Loading...</div>;

  // If no user (auth not configured), allow access
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

// Main app with sidebar navigation
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  // Extract current module from path
  const path = location.pathname.slice(1) || 'dashboard';

  const handleLogout = async () => {
    await signOut();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  return <DashboardPage activeModule={path} onNavigate={navigate} onLogout={handleLogout} />;
};

function AppContent() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const { setUser, setInitialized } = useAuthStore();
  const { theme } = useThemeStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setInitialized();
    return () => subscription.unsubscribe();
  }, [setUser, setInitialized]);

  if (!ready) {
    return <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-gray-400 text-xl">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className={theme}>
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
