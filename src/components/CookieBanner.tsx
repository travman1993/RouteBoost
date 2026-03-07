'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: 'rgba(18, 20, 26, 0.97)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0, flex: 1, minWidth: '200px' }}>
        We use cookies for analytics to improve your experience.{' '}
        <Link href="/privacy" style={{ color: '#f97316', textDecoration: 'underline' }}>Learn more</Link>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button onClick={decline} style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.6)',
          padding: '8px 18px',
          borderRadius: '50px',
          fontSize: '0.875rem',
          cursor: 'pointer',
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          background: '#f97316',
          border: 'none',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: '50px',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Accept
        </button>
      </div>
    </div>
  );
}
