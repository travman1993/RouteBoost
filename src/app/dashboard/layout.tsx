'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: '📍', activeIcon: '📍' },
  { href: '/dashboard/posts', label: 'Posts', icon: '📣', activeIcon: '📣' },
  { href: '/dashboard/events', label: 'Events', icon: '🎪', activeIcon: '🎪' },
  { href: '/dashboard/insights', label: 'Insights', icon: '🧠', activeIcon: '🧠' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.appShell}>
      <main className={styles.appContent}>
        {children}
      </main>

      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{isActive ? item.activeIcon : item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}