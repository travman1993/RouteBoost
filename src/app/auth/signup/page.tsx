'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [truckName, setTruckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            truck_name: truckName,
          },
        },
      });

      if (authError) throw authError;

      // 2. Create truck profile in database
      if (authData.user) {
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { error: profileError } = await supabase
          .from('trucks')
          .insert({
            id: authData.user.id,
            name: truckName,
            email: email,
            onboarding_complete: false,
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't block signup if profile fails — we can recover later
        }
      }

      // 3. Redirect to verification page
      router.push('/auth/verify');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupCard}>
      <h1 className={styles.title}>Start your free trial</h1>
      <p className={styles.subtitle}>7 days free. No credit card required.</p>

      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label className="form-label" htmlFor="truckName">
            Food Truck Name
          </label>
          <input
            id="truckName"
            type="text"
            className="form-input"
            placeholder="e.g. Taco Fuego"
            value={truckName}
            onChange={(e) => setTruckName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          style={{ marginTop: '8px' }}
        >
          {loading ? <span className="spinner" /> : 'Create Account →'}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <a href="/auth/login" className={styles.switchLink}>
          Log in
        </a>
      </p>
    </div>
  );
}