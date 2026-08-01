'use client';

import { useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  );
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        return;
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400 mb-8">Enter your password to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-fuchsia-400 focus:outline-none disabled:opacity-50 transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-fuchsia-600 px-4 py-3 font-medium text-white hover:bg-fuchsia-700 disabled:opacity-50 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-6 text-center">
            🔒 This area is protected with JWT authentication and rate limiting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between bg-slate-900/50 border-b border-white/10 p-4 sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
      <AdminDashboard token={token} />
    </div>
  );
}
