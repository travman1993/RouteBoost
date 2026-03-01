'use client';

import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [truckName, setTruckName] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: truck } = await supabase
          .from('trucks')
          .select('name')
          .eq('id', user.id)
          .single();
        if (truck) setTruckName(truck.name);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className={styles.dashboard}>
      <nav className={styles.topBar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔥</span>
          RouteBoost
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h1 className={styles.welcomeTitle}>
            Welcome{truckName ? `, ${truckName}` : ''}! 👋
          </h1>
          <p className={styles.welcomeText}>
            Your dashboard is coming soon. This is where you&apos;ll see your daily plan,
            AI-generated posts, event opportunities, and growth insights.
          </p>

          <div className={styles.comingSoonGrid}>
            <div className={styles.comingSoonCard}>
              <span className={styles.csIcon}>📍</span>
              <h3>Today&apos;s Plan</h3>
              <p>Your daily command center</p>
              <span className={styles.csTag}>Coming Soon</span>
            </div>
            <div className={styles.comingSoonCard}>
              <span className={styles.csIcon}>📣</span>
              <h3>Post Creator</h3>
              <p>AI-generated social posts</p>
              <span className={styles.csTag}>Coming Soon</span>
            </div>
            <div className={styles.comingSoonCard}>
              <span className={styles.csIcon}>🎪</span>
              <h3>Events</h3>
              <p>Booking opportunities</p>
              <span className={styles.csTag}>Coming Soon</span>
            </div>
            <div className={styles.comingSoonCard}>
              <span className={styles.csIcon}>🧠</span>
              <h3>Insights</h3>
              <p>AI growth advisor</p>
              <span className={styles.csTag}>Coming Soon</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}