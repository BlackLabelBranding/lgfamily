import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider.jsx';

function AuthGate({ children }) {
  const { user, loading, signInWithOtp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const { error } = await signInWithOtp(email);

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage('Check your email for the magic link.');
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-background">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Sign in to FamilyHub</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email and we’ll send you a secure magic link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg border px-4 py-2 text-sm font-medium"
            >
              {submitting ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <button
          onClick={signOut}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}

export default AuthGate;
