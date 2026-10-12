'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { Button, Card, CardBody, Input } from '@heroui/react';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // The session lives in an HTTP-only cookie, so the page cannot read it.
  // It asks the server whether that cookie is still valid instead.
  useEffect(() => {
    let isActive = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (isActive) {
          setAuthenticated(Boolean(data.authenticated));
        }
      } catch {
        if (isActive) {
          setAuthenticated(false);
        }
      } finally {
        if (isActive) {
          setCheckedSession(true);
        }
      }
    }

    checkSession();

    return () => {
      isActive = false;
    };
  }, []);

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

      // No token is stored here on purpose: the server set the cookie.
      setAuthenticated(true);
      setPassword('');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the request fails, drop the local view of the session.
    }

    setAuthenticated(false);
  };

  if (!checkedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <p className="text-slate-400">Checking your session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur">
          <CardBody className="p-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Admin Access</h1>
            <p className="mb-8 text-slate-400">Enter your password to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Input
                type="password"
                label="Admin password"
                labelPlacement="outside"
                placeholder="Admin Password"
                value={password}
                onValueChange={setPassword}
                isDisabled={loading}
                classNames={{ inputWrapper: 'bg-slate-800 border border-white/10' }}
              />

              <Button
                type="submit"
                fullWidth
                color="secondary"
                isLoading={loading}
                className="py-3 font-medium"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Protected with an HTTP-only session cookie and rate limiting
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-900/50 p-4">
        <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        <Button color="danger" size="sm" onPress={handleLogout} className="font-medium">
          Logout
        </Button>
      </div>
      <AdminDashboard />
    </div>
  );
}
