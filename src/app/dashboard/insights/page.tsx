import styles from '../dashboard.module.css';

export default function InsightsPage() {
  return (
    <div className={styles.comingSoonPage}>
      <div className={styles.comingSoonIcon}>🧠</div>
      <h1>AI Insights</h1>
      <p>Plain-language advice powered by your daily feedback. Like having a growth coach that learns what works for your truck.</p>
      <span className={styles.comingSoonTag}>Coming Soon</span>
    </div>
  );
}