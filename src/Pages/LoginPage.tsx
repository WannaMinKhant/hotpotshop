import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useNavigate } from 'react-router-dom';
import { roleDefaultPage } from '../lib/roles';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, fetchRole } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          addToast('Account created! Please check your email to confirm.', 'success');
        } else {
          addToast('Sign up successful!', 'success');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          // Fetch user's role from database
          await fetchRole(data.user.id);
          addToast('Welcome back!', 'success');
          // Navigate to role's default page (read fresh from store)
          const userRole = useAuthStore.getState().role;
          const defaultPage = roleDefaultPage[userRole] || 'dashboard';
          navigate(`/${defaultPage}`);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center p-4">
      <div className="bg-[#272a30] rounded-2xl border border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">🍲 B2M</h1>
          <p className="text-gray-400">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-3 rounded-lg font-bold text-lg transition"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-gray-400 hover:text-yellow-400 text-sm transition"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs text-center">
          <p className="font-semibold mb-1">Demo Mode</p>
          <p>If Supabase auth isn't configured yet, you can still access the app.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
