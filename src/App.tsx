import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useToastStore } from './stores/toastStore';
import { useThemeStore } from './stores/themeStore';
import { rolePermissions, roleDefaultPage } from './lib/roles';
import ToastContainer from './Components/ToastContainer';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import './App.css';

// Protected route wrapper — checks auth + role-based module access
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-gray-400">Loading...</div>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

// Main app with sidebar navigation + role-based module protection
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut, fetchRole } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  // Extract current module from path
  const path = location.pathname.slice(1) || 'dashboard';

  // Fetch role on mount if not yet loaded
  useEffect(() => {
    if (user && !role) {
      fetchRole(user.id);
    }
  }, [user, role, fetchRole]);

  // Check if user has access to current module
  const allowedModules = rolePermissions[role] || [];
  const hasAccess = allowedModules.includes(path);

  // Redirect to role's default page if no access
  useEffect(() => {
    if (role && !hasAccess) {
      const defaultPage = roleDefaultPage[role] || 'dashboard';
      addToast(`You don't have access to this page`, 'warning');
      navigate(`/${defaultPage}`, { replace: true });
    }
  }, [role, hasAccess, path, navigate, addToast]);

  const handleLogout = async () => {
    await signOut();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  // Show loading while role is being fetched
  if (!role) {
    return <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-gray-400">Loading...</div>;
  }

  // If no access and not redirecting yet, show denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-center">
        <div>
          <p className="text-6xl mb-4">🚫</p>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Your role doesn't have permission to access this page.</p>
          <button
            onClick={() => navigate(`/${roleDefaultPage[role] || 'dashboard'}`)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
  const { setUser, setInitialized, fetchRole } = useAuthStore();
  const { theme } = useThemeStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
      setReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
    });

    setInitialized();
    return () => subscription.unsubscribe();
  }, [setUser, setInitialized, fetchRole]);

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
