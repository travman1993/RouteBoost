import styles from './auth.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authGlow} />
      <div className={styles.authContainer}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🔥</span>
          RouteBoost
        </a>
        {children}
      </div>
    </div>
  );
}