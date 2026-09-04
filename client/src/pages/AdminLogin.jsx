import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

/* ============================================================
   ADMIN LOGIN — Operations Console Authentication
   ============================================================ */

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'admin');
      navigate('/admin');
    } catch (err) {
      if (!err?.response) {
        setError('Cannot reach the server. If on mobile, use the laptop\u2019s network URL (not localhost).');
      } else {
        setError(
          err.response?.data?.message || 'Invalid administrator credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#05080f] text-zinc-900 dark:text-white p-6 transition-colors">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <Brand sub="HQ" />
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Link
              to="/"
              className="text-xs font-mono text-zinc-500 dark:text-[#94a3b8] hover:text-black dark:hover:text-white transition-colors"
            >
              Exit &rarr;
            </Link>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-[#1f2734] rounded-2xl p-7 bg-zinc-50 dark:bg-[#0a0f1c] shadow-2xl transition-colors">
          <h2 className="text-xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white">
            System Administration
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Authorized station controllers and supervisors only
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@OneCoolie.in"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Enter Operations Console'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[11px] font-mono text-zinc-500 dark:text-[#94a3b8]">
          OneCoolie Dispatch v2.0
        </p>
      </div>
    </div>
  );
}