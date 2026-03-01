'use client';

import styles from './verify.module.css';

export default function VerifyPage() {
  return (
    <div className={styles.verifyCard}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>📧</span>
      </div>
      <h1 className={styles.title}>Check your email</h1>
      <p className={styles.message}>
        We sent a verification link to your inbox. Click the link to activate
        your RouteBoost account and start your free trial.
      </p>
      <div className={styles.tips}>
        <p className={styles.tipLabel}>Didn&apos;t get the email?</p>
        <ul className={styles.tipList}>
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the correct email</li>
          <li>Wait a minute and check again</li>
        </ul>
      </div>
      <a href="/auth/login" className={styles.backLink}>
        ← Back to login
      </a>
    </div>
  );
}