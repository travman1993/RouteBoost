'use client';

import { useState } from 'react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/email-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus('success');
      setEmail('');
    } else {
      setStatus('error');
    }
  }

  return (
    <section style={{
      padding: '80px 24px',
      background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.03) 100%)',
      borderTop: '1px solid rgba(249,115,22,0.15)',
      borderBottom: '1px solid rgba(249,115,22,0.15)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(249,115,22,0.12)',
          color: '#f97316',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          borderRadius: '50px',
          marginBottom: '20px',
        }}>
          Stay in the Loop
        </div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800,
          color: '#f5f0e8',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}>
          Not ready to sign up yet?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '1rem',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}>
          Drop your email and we'll send you tips, updates, and a reminder when you're ready to grow.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(0,232,157,0.1)',
            border: '1px solid rgba(0,232,157,0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            color: '#00e89d',
            fontWeight: 600,
          }}>
            You're in. We'll be in touch!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: '1',
                minWidth: '220px',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50px',
                color: '#f5f0e8',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Keep Me Posted'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '12px' }}>
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </section>
  );
}
